// 存储待上传的文件
let filesToUpload = [];

// OSS配置信息 - 这些需要替换为您的实际配置
const ossConfig = {
    accessKeyId: 'LTAI5tS9jwk5SFTduEG53BL6', // 需要填写
    accessKeySecret: 'OpbqIRuTd2sA1XhQAv9rP2t0MTp70t', // 需要填写
    bucket: 'file-sjtu', // 需要填写
    region: 'oss-cn-shanghai', // 例如: 'oss-cn-hangzhou'
    secure: true // 使用HTTPS
};

// DOM元素
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const fileCount = document.getElementById('fileCount');
const clearBtn = document.getElementById('clearBtn');
const uploadBtn = document.getElementById('uploadBtn');

// 初始化
function init() {
    // 拖拽事件
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleFileDrop);
    dropZone.addEventListener('click', () => fileInput.click());
    
    // 文件选择事件
    fileInput.addEventListener('change', handleFileSelect);
    
    // 按钮事件
    clearBtn.addEventListener('click', clearFileList);
    uploadBtn.addEventListener('click', uploadFiles);
    
    // 初始化文件计数
    updateFileCount();
}

// 处理拖拽悬停
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('dragover');
}

// 处理拖拽离开
function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('dragover');
}

// 处理文件拖放
function handleFileDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('dragover');
    
    const dt = e.dataTransfer;
    const files = dt.files;
    
    handleFiles(files);
}

// 处理文件选择
function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
    // 重置input，允许选择相同文件
    fileInput.value = '';
}

// 处理文件
function handleFiles(files) {
    if (!files.length) return;
    
    // 过滤非图片文件
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    // 添加到待上传列表
    imageFiles.forEach(file => {
        // 检查是否已存在相同文件
        const isDuplicate = filesToUpload.some(f => 
            f.name === file.name && 
            f.size === file.size && 
            f.type === file.type
        );
        
        if (!isDuplicate) {
            filesToUpload.push(file);
            addFileToList(file);
        }
    });
}

// 更新文件计数
function updateFileCount() {
    fileCount.textContent = `${filesToUpload.length} 个文件`;
}

// 添加文件到列表
function addFileToList(file) {
    const li = document.createElement('li');
    li.dataset.filename = file.name;
    
    // 创建文件预览
    const fileInfo = document.createElement('div');
    fileInfo.className = 'file-info';
    
    const preview = document.createElement('img');
    preview.className = 'file-preview';
    preview.src = URL.createObjectURL(file);
    preview.onload = () => URL.revokeObjectURL(preview.src);
    
    const fileName = document.createElement('span');
    fileName.className = 'file-name';
    fileName.textContent = file.name;
    
    const fileSize = document.createElement('span');
    fileSize.className = 'file-size';
    fileSize.textContent = formatFileSize(file.size);
    
    fileInfo.appendChild(preview);
    fileInfo.appendChild(fileName);
    fileInfo.appendChild(fileSize);
    
    // 创建删除按钮
    const removeBtn = document.createElement('button');
    removeBtn.className = 'file-remove';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.addEventListener('click', () => removeFile(file.name));
    
    // 创建进度条容器
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';
    progressContainer.style.display = 'none';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    
    const progressBarInner = document.createElement('div');
    progressBarInner.className = 'progress-bar-inner';
    
    const uploadStatus = document.createElement('div');
    uploadStatus.className = 'upload-status';
    
    progressBar.appendChild(progressBarInner);
    progressContainer.appendChild(progressBar);
    progressContainer.appendChild(uploadStatus);
    
    // 组装列表项
    li.appendChild(fileInfo);
    li.appendChild(removeBtn);
    li.appendChild(progressContainer);
    
    fileList.appendChild(li);
    
    // 更新文件计数
    updateFileCount();
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 移除单个文件
function removeFile(fileName) {
    // 从数组中移除
    filesToUpload = filesToUpload.filter(file => file.name !== fileName);
    
    // 从DOM中移除
    const fileItem = fileList.querySelector(`li[data-filename="${fileName}"]`);
    if (fileItem) {
        fileList.removeChild(fileItem);
    }
    
    // 更新文件计数
    updateFileCount();
}

// 清空文件列表
function clearFileList() {
    filesToUpload = [];
    fileList.innerHTML = '';
    
    // 更新文件计数
    updateFileCount();
}

// 上传文件到OSS
async function uploadFiles() {
    if (filesToUpload.length === 0) {
        alert('请先选择要上传的文件');
        return;
    }
    
    // 检查OSS配置
    if (!ossConfig.accessKeyId || !ossConfig.accessKeySecret || !ossConfig.bucket || !ossConfig.region) {
        alert('请先配置OSS参数');
        return;
    }
    
    // 初始化OSS客户端
    const client = new OSS({
        accessKeyId: ossConfig.accessKeyId,
        accessKeySecret: ossConfig.accessKeySecret,
        bucket: ossConfig.bucket,
        region: ossConfig.region,
        secure: ossConfig.secure
    });
    
    // 显示所有进度条
    document.querySelectorAll('.progress-container').forEach(container => {
        container.style.display = 'block';
    });
    
    // 上传所有文件
    const uploadPromises = filesToUpload.map(file => {
        return uploadFileToOSS(client, file);
    });
    
    try {
        await Promise.all(uploadPromises);
        alert('所有文件上传完成');
    } catch (error) {
        console.error('上传过程中发生错误:', error);
    }
}

// 上传单个文件到OSS
async function uploadFileToOSS(client, file) {
    const fileItem = fileList.querySelector(`li[data-filename="${file.name}"]`);
    const progressBarInner = fileItem.querySelector('.progress-bar-inner');
    const uploadStatus = fileItem.querySelector('.upload-status');
    
// 使用原始文件名（不添加时间戳）
    // 获取用户设置的上传路径
    const uploadPath = document.getElementById('uploadPath').value || '/nos';
    const objectName = `${uploadPath}/${file.name}`;
    
    try {
        // 上传文件并监听进度
        const result = await client.multipartUpload(objectName, file, {
            progress: (p) => {
                const percent = Math.floor(p * 100);
                progressBarInner.style.width = `${percent}%`;
                uploadStatus.textContent = `上传中: ${percent}%`;
            }
        });
        
        // 上传成功
        progressBarInner.style.width = '100%';
        uploadStatus.textContent = '上传成功';
        uploadStatus.className = 'upload-status upload-success';
        
        // 返回文件URL
        const url = client.signatureUrl(objectName);
        console.log('文件上传成功，URL:', url);
        
        return result;
    } catch (error) {
        // 上传失败
        uploadStatus.textContent = `上传失败: ${error.message}`;
        uploadStatus.className = 'upload-status upload-error';
        throw error;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
