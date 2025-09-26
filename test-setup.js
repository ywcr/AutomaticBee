#!/usr/bin/env node

/**
 * 精灵蜂 Electron 版本设置测试脚本
 * 用于验证项目配置是否正确
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 精灵蜂 Electron 版本 - 设置检查');
console.log('=====================================\n');

let hasErrors = false;

// 检查 Node.js 版本
function checkNodeVersion() {
    try {
        const version = process.version;
        const majorVersion = parseInt(version.slice(1).split('.')[0]);
        
        if (majorVersion >= 16) {
            console.log(`✅ Node.js 版本: ${version} (符合要求)`);
        } else {
            console.log(`❌ Node.js 版本: ${version} (需要 16.0 或更高版本)`);
            hasErrors = true;
        }
    } catch (error) {
        console.log('❌ 无法检查 Node.js 版本');
        hasErrors = true;
    }
}

// 检查必要文件
function checkRequiredFiles() {
    const requiredFiles = [
        'package.json',
        'src/main/main.js',
        'src/main/proxy-server.js',
        'src/main/preload.js',
        'src/renderer/index.html',
        'src/renderer/login.html',
        'src/renderer/main.html'
    ];

    console.log('\n📁 检查必要文件:');
    
    requiredFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            console.log(`✅ ${file}`);
        } else {
            console.log(`❌ ${file} (缺失)`);
            hasErrors = true;
        }
    });
}

// 检查 package.json 配置
function checkPackageJson() {
    try {
        const packagePath = path.join(__dirname, 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        console.log('\n📦 检查 package.json 配置:');
        
        // 检查主入口
        if (packageJson.main === 'src/main/main.js') {
            console.log('✅ 主入口文件配置正确');
        } else {
            console.log('❌ 主入口文件配置错误');
            hasErrors = true;
        }
        
        // 检查脚本
        const requiredScripts = ['start', 'dev'];
        requiredScripts.forEach(script => {
            if (packageJson.scripts && packageJson.scripts[script]) {
                console.log(`✅ 脚本 "${script}" 已配置`);
            } else {
                console.log(`❌ 脚本 "${script}" 未配置`);
                hasErrors = true;
            }
        });
        
        // 检查依赖
        const requiredDeps = ['electron', 'express', 'http-proxy-middleware'];
        const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        requiredDeps.forEach(dep => {
            if (allDeps[dep]) {
                console.log(`✅ 依赖 "${dep}" 已配置`);
            } else {
                console.log(`❌ 依赖 "${dep}" 未配置`);
                hasErrors = true;
            }
        });
        
    } catch (error) {
        console.log('❌ 无法读取或解析 package.json');
        hasErrors = true;
    }
}

// 检查前端资源
function checkFrontendResources() {
    console.log('\n🎨 检查前端资源:');
    
    const resourceDirs = [
        'src/renderer/lgb/js',
        'src/renderer/lgb/css',
        'src/renderer/lgb/images',
        'src/renderer/lgb/layui'
    ];
    
    resourceDirs.forEach(dir => {
        const dirPath = path.join(__dirname, dir);
        if (fs.existsSync(dirPath)) {
            console.log(`✅ ${dir}`);
        } else {
            console.log(`⚠️  ${dir} (可选，但建议复制原有资源)`);
        }
    });
}

// 检查网络连接
function checkNetworkConnection() {
    console.log('\n🌐 检查网络连接:');
    
    try {
        // 这里只是示例，实际可能需要更复杂的网络检查
        console.log('ℹ️  网络连接检查需要在运行时进行');
        console.log('   请确保可以访问 https://zxyy.ltd');
        console.log('   请确保可以访问 https://g.alicdn.com');
    } catch (error) {
        console.log('⚠️  无法检查网络连接');
    }
}

// 提供修复建议
function provideSuggestions() {
    if (hasErrors) {
        console.log('\n🔧 修复建议:');
        console.log('1. 确保 Node.js 版本 >= 16.0');
        console.log('2. 运行 "npm install" 安装依赖');
        console.log('3. 检查所有必要文件是否存在');
        console.log('4. 确保从原项目复制了前端资源文件');
        console.log('5. 检查网络连接和防火墙设置');
    } else {
        console.log('\n🎉 所有检查通过！');
        console.log('可以运行以下命令启动应用:');
        console.log('  npm run dev    # 开发模式');
        console.log('  npm start      # 生产模式');
        console.log('  ./start.sh     # 使用启动脚本 (Linux/macOS)');
        console.log('  start.bat      # 使用启动脚本 (Windows)');
    }
}

// 运行所有检查
function runAllChecks() {
    checkNodeVersion();
    checkRequiredFiles();
    checkPackageJson();
    checkFrontendResources();
    checkNetworkConnection();
    provideSuggestions();
    
    console.log('\n=====================================');
    if (hasErrors) {
        console.log('❌ 发现问题，请根据建议进行修复');
        process.exit(1);
    } else {
        console.log('✅ 设置检查完成，可以启动应用');
        process.exit(0);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    runAllChecks();
}

module.exports = {
    checkNodeVersion,
    checkRequiredFiles,
    checkPackageJson,
    checkFrontendResources,
    checkNetworkConnection,
    runAllChecks
};
