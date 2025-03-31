const express = require('express');
const { exec } = require('child_process');
const { promisify } = require('util');

const app = express();
const port = 3000; // 服务监听的端口
const execPromise = promisify(exec);

// 基本的输入验证函数
function isValidHost(host) {
    // 简单的验证：不允许包含特殊字符，防止命令注入
    // 注意：这只是基础验证，生产环境需要更严格的规则
    // 例如，可以限制为 IP 地址或特定格式的域名
    const invalidChars = /[\$\`\{\}\(\)\;\|\&\<\>\'\"\!]/;
    return host && typeof host === 'string' && !invalidChars.test(host);
}

function isValidPorts(ports) {
    // 验证端口字符串格式：数字、逗号、短横线
    const validPortChars = /^[\d,\-]+$/;
    if (!ports || typeof ports !== 'string' || !validPortChars.test(ports)) {
        return false;
    }
    // 进一步验证端口范围和数值
    const parts = ports.split(',');
    for (const part of parts) {
        const trimmedPart = part.trim();
        if (trimmedPart.includes('-')) {
            const [startStr, endStr] = trimmedPart.split('-');
            const start = parseInt(startStr, 10);
            const end = parseInt(endStr, 10);
            if (isNaN(start) || isNaN(end) || start < 1 || end > 65535 || start > end) {
                return false;
            }
        } else {
            const portNum = parseInt(trimmedPart, 10);
            if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
                return false;
            }
        }
    }
    return true;
}

app.get('/scan', async (req, res) => {
    const { host, ports } = req.query;

    console.log(`Received scan request for host: ${host}, ports: ${ports}`);

    // --- 输入验证 --- 
    if (!isValidHost(host)) {
        console.error('Invalid host parameter:', host);
        return res.status(400).json({ error: 'Invalid host parameter' });
    }
    if (!isValidPorts(ports)) {
        console.error('Invalid ports parameter:', ports);
        return res.status(400).json({ error: 'Invalid ports parameter' });
    }

    // 构建 nmap 命令
    // -Pn: 不进行 ping 扫描 (假设主机在线)
    // -T4: 加速扫描 (更积极的时间模板)
    // --open: 只显示开放的端口
    // -oG -: 使用 Grepable 输出格式到标准输出，方便解析
    // 使用 escapeshellarg 类似的功能来确保参数安全 (这里简化处理，手动检查为主)
    // const command = `nmap -p "${ports}" -Pn -T4 --open -oG - ${host}`;
    const command = `nmap -p "${ports}" -Pn -T4 ${host}`; // 使用 -T2 降低扫描速度，尝试获取更稳定的 filtered 结果
    console.log(`Executing command: ${command}`);

    try {
        // 增加超时时间，因为完整扫描可能更耗时
        const { stdout, stderr } = await execPromise(command, { timeout: 300000 }); // 5分钟超时

        if (stderr) {
            console.error(`nmap stderr: ${stderr}`);
            // 某些 stderr 可能是警告或信息，不一定是错误，也包含在结果中
        }

        console.log(`nmap command finished.`);
        // 直接返回原始输出
        res.json({ rawOutput: stdout, errorOutput: stderr || null });

    } catch (error) {
        console.error(`Error executing nmap: ${error}`);
        // 在错误情况下，也尝试返回 stderr（如果可用）
        const errorOutput = error.stderr || 'Nmap command failed or timed out.';
        // 分析错误类型并返回合适的响应
        if (error.signal === 'SIGTERM') { // 超时
             res.status(504).json({ error: 'Nmap scan timed out.', rawOutput: null, errorOutput: errorOutput });
        } else if (error.stderr && error.stderr.includes('Failed to resolve')) {
             res.status(400).json({ error: `Failed to resolve host: ${host}`, rawOutput: null, errorOutput: errorOutput });
        } else {
             // 其他错误，返回 500 状态码和错误信息
             res.status(500).json({ error: 'An error occurred during the scan.', rawOutput: null, errorOutput: errorOutput });
        }
    }
});

app.listen(port, () => {
    console.log(`Scanner service listening at http://localhost:${port}`);
}); 