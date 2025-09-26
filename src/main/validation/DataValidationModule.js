/**
 * 数据验证模块
 * 实现数据验证、遗漏检测、补漏功能
 */

const EventEmitter = require('events');

class DataValidationModule extends EventEmitter {
    constructor(apiManager) {
        super();
        this.apiManager = apiManager;
    }

    /**
     * 验证指定日期的问卷创建情况
     * @param {string} date - 验证日期 (YYYY-MM-DD)
     * @param {string} projectId - 项目ID
     * @param {Object} localData - 本地数据 (按指派人分组)
     * @returns {Object} 验证结果
     */
    async validateCreatedSurveys(date, projectId, localData) {
        try {
            this.emit('validationStarted', { date, projectId });

            // 获取已创建的问卷列表
            const createdSurveys = await this.apiManager.getQuestionnaireList(projectId, date, 1, 100000);
            
            // 提取已创建问卷的姓名列表
            const createdNames = createdSurveys
                .map(item => item.workOrderValue || item.patientName || item.consumerName || '')
                .filter(name => name);

            // 获取本地数据中指定日期的姓名列表
            const localNames = this.getLocalNamesForDate(localData, date);

            // 计算遗漏和额外的问卷
            const missing = localNames.filter(name => !createdNames.includes(name));
            const extra = createdNames.filter(name => !localNames.includes(name));

            const result = {
                date,
                projectId,
                localCount: localNames.length,
                createdCount: createdSurveys.length,
                missing,
                extra,
                isComplete: missing.length === 0
            };

            this.emit('validationCompleted', result);
            return result;

        } catch (error) {
            this.emit('validationError', { date, projectId, error });
            throw error;
        }
    }

    /**
     * 批量验证多个日期
     * @param {Array} dates - 日期列表
     * @param {string} projectId - 项目ID
     * @param {Object} localData - 本地数据
     * @returns {Array} 验证结果列表
     */
    async batchValidate(dates, projectId, localData) {
        const results = [];
        
        for (const date of dates) {
            try {
                const result = await this.validateCreatedSurveys(date, projectId, localData);
                results.push(result);
                
                // 添加延迟避免请求过于频繁
                await this.delay(500);
            } catch (error) {
                results.push({
                    date,
                    projectId,
                    error: error.message,
                    isError: true
                });
            }
        }
        
        return results;
    }

    /**
     * 验证指派人在指定日期的数据
     * @param {string} assignee - 指派人
     * @param {string} date - 日期 (YYYY-MM-DD)
     * @param {string} projectId - 项目ID
     * @param {Array} assigneeData - 指派人的数据
     * @returns {Object} 验证结果
     */
    async validateAssigneeData(assignee, date, projectId, assigneeData) {
        try {
            // 获取已创建的问卷
            const createdSurveys = await this.apiManager.getQuestionnaireList(projectId, date, 1, 100000);
            const createdNames = createdSurveys
                .map(item => item.workOrderValue || item.patientName || item.consumerName || '')
                .filter(name => name);

            // 获取指派人在指定日期的本地数据
            const localNames = assigneeData
                .filter(item => item.时间?.fullDate === date)
                .map(item => item.姓名);

            // 计算遗漏和额外
            const missing = localNames.filter(name => !createdNames.includes(name));
            const extra = createdNames.filter(name => !localNames.includes(name));

            return {
                assignee,
                date,
                projectId,
                localCount: localNames.length,
                createdCount: createdNames.length,
                missing,
                extra,
                isComplete: missing.length === 0,
                localNames,
                createdNames
            };

        } catch (error) {
            throw new Error(`验证指派人 ${assignee} 数据失败: ${error.message}`);
        }
    }

    /**
     * 自动补漏遗漏的问卷
     * @param {Object} validationResult - 验证结果
     * @param {Object} localData - 本地数据
     * @param {string} questionnaireType - 问卷类型
     * @returns {Object} 补漏结果
     */
    async autoRetryMissing(validationResult, localData, questionnaireType) {
        try {
            if (validationResult.missing.length === 0) {
                return { success: true, message: '无需补漏', retried: 0 };
            }

            this.emit('retryStarted', { 
                date: validationResult.date, 
                missing: validationResult.missing 
            });

            // 找到遗漏的数据项
            const missingItems = this.findMissingItems(validationResult, localData);
            
            if (missingItems.length === 0) {
                return { success: false, message: '未找到遗漏的数据项', retried: 0 };
            }

            // 执行补漏
            const results = { successful: [], failed: [] };
            
            for (const item of missingItems) {
                try {
                    this.emit('retryProgress', { 
                        current: results.successful.length + results.failed.length + 1,
                        total: missingItems.length,
                        item: item.姓名
                    });

                    const result = await this.apiManager.createQuestionnaire(questionnaireType, item);
                    results.successful.push({ item, result });
                    
                    this.emit('retryItemSuccess', { item, result });
                } catch (error) {
                    results.failed.push({ item, error });
                    this.emit('retryItemFailed', { item, error });
                }

                // 添加延迟
                await this.delay(1500);
            }

            this.emit('retryCompleted', { 
                date: validationResult.date,
                results,
                total: missingItems.length,
                successful: results.successful.length,
                failed: results.failed.length
            });

            return {
                success: true,
                results,
                retried: missingItems.length,
                successful: results.successful.length,
                failed: results.failed.length
            };

        } catch (error) {
            this.emit('retryError', { validationResult, error });
            throw error;
        }
    }

    /**
     * 获取本地数据中指定日期的姓名列表
     * @param {Object} localData - 本地数据
     * @param {string} date - 日期 (YYYY-MM-DD)
     * @returns {Array} 姓名列表
     */
    getLocalNamesForDate(localData, date) {
        const names = [];
        
        Object.values(localData).forEach(assigneeData => {
            if (Array.isArray(assigneeData)) {
                assigneeData.forEach(item => {
                    if (item.时间?.fullDate === date) {
                        names.push(item.姓名);
                    }
                });
            }
        });
        
        return names;
    }

    /**
     * 查找遗漏的数据项
     * @param {Object} validationResult - 验证结果
     * @param {Object} localData - 本地数据
     * @returns {Array} 遗漏的数据项
     */
    findMissingItems(validationResult, localData) {
        const missingItems = [];
        const missingNames = new Set(validationResult.missing);
        
        Object.values(localData).forEach(assigneeData => {
            if (Array.isArray(assigneeData)) {
                assigneeData.forEach(item => {
                    if (item.时间?.fullDate === validationResult.date && 
                        missingNames.has(item.姓名)) {
                        missingItems.push(item);
                    }
                });
            }
        });
        
        return missingItems;
    }

    /**
     * 生成验证报告
     * @param {Array} validationResults - 验证结果列表
     * @returns {Object} 验证报告
     */
    generateValidationReport(validationResults) {
        const report = {
            totalDates: validationResults.length,
            completeDates: 0,
            incompleteDates: 0,
            totalMissing: 0,
            totalExtra: 0,
            totalLocal: 0,
            totalCreated: 0,
            details: [],
            summary: {}
        };

        validationResults.forEach(result => {
            if (result.isError) {
                report.details.push({
                    date: result.date,
                    status: 'error',
                    error: result.error
                });
                return;
            }

            if (result.isComplete) {
                report.completeDates++;
            } else {
                report.incompleteDates++;
            }

            report.totalMissing += result.missing.length;
            report.totalExtra += result.extra.length;
            report.totalLocal += result.localCount;
            report.totalCreated += result.createdCount;

            report.details.push({
                date: result.date,
                status: result.isComplete ? 'complete' : 'incomplete',
                localCount: result.localCount,
                createdCount: result.createdCount,
                missingCount: result.missing.length,
                extraCount: result.extra.length,
                missing: result.missing,
                extra: result.extra
            });
        });

        // 生成摘要
        report.summary = {
            completionRate: report.totalDates > 0 ? 
                (report.completeDates / report.totalDates * 100).toFixed(2) + '%' : '0%',
            missingRate: report.totalLocal > 0 ? 
                (report.totalMissing / report.totalLocal * 100).toFixed(2) + '%' : '0%',
            averageLocalPerDate: report.totalDates > 0 ? 
                (report.totalLocal / report.totalDates).toFixed(1) : '0',
            averageCreatedPerDate: report.totalDates > 0 ? 
                (report.totalCreated / report.totalDates).toFixed(1) : '0'
        };

        return report;
    }

    /**
     * 导出验证结果为 CSV
     * @param {Array} validationResults - 验证结果
     * @param {string} filename - 文件名
     * @returns {string} CSV 内容
     */
    exportValidationResultsToCSV(validationResults, filename = 'validation_results.csv') {
        const headers = ['日期', '本地数据', '已创建', '遗漏数量', '额外数量', '完成状态', '遗漏名单', '额外名单'];
        const rows = [headers];

        validationResults.forEach(result => {
            if (result.isError) {
                rows.push([
                    result.date,
                    '错误',
                    '错误',
                    '错误',
                    '错误',
                    '错误',
                    result.error,
                    ''
                ]);
            } else {
                rows.push([
                    result.date,
                    result.localCount,
                    result.createdCount,
                    result.missing.length,
                    result.extra.length,
                    result.isComplete ? '完成' : '未完成',
                    result.missing.join('; '),
                    result.extra.join('; ')
                ]);
            }
        });

        // 转换为 CSV 格式
        const csvContent = '\uFEFF' + rows.map(row => 
            row.map(cell => `"${cell}"`).join(',')
        ).join('\n');

        return csvContent;
    }

    /**
     * 导出遗漏名单为 CSV
     * @param {Object} validationResult - 验证结果
     * @returns {string} CSV 内容
     */
    exportMissingToCSV(validationResult) {
        if (!validationResult.missing || validationResult.missing.length === 0) {
            return '\uFEFF姓名\n';
        }

        let csv = '\uFEFF姓名\n';
        validationResult.missing.forEach(name => {
            csv += `"${name}"\n`;
        });

        return csv;
    }

    /**
     * 延迟函数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 获取日期范围内的所有日期
     * @param {string} startDate - 开始日期
     * @param {string} endDate - 结束日期
     * @returns {Array} 日期列表
     */
    getDateRange(startDate, endDate) {
        const dates = [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            dates.push(date.toISOString().split('T')[0]);
        }
        
        return dates;
    }

    /**
     * 格式化验证结果为可读文本
     * @param {Object} validationResult - 验证结果
     * @returns {string} 格式化文本
     */
    formatValidationResult(validationResult) {
        if (validationResult.isError) {
            return `日期: ${validationResult.date}\n状态: 验证失败\n错误: ${validationResult.error}`;
        }

        const lines = [
            `日期: ${validationResult.date}`,
            `本地数据: ${validationResult.localCount} 条`,
            `已创建: ${validationResult.createdCount} 条`,
            `状态: ${validationResult.isComplete ? '✅ 完成' : '❌ 未完成'}`
        ];

        if (validationResult.missing.length > 0) {
            lines.push(`未创建 (${validationResult.missing.length}): ${validationResult.missing.join(', ')}`);
        }

        if (validationResult.extra.length > 0) {
            lines.push(`额外创建 (${validationResult.extra.length}): ${validationResult.extra.join(', ')}`);
        }

        return lines.join('\n');
    }
}

module.exports = DataValidationModule;
