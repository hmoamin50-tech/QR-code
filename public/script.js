document.addEventListener('DOMContentLoaded', function() {
  const urlInput = document.getElementById('urlInput');
  const generateBtn = document.getElementById('generateBtn');
  const qrPlaceholder = document.getElementById('qrPlaceholder');
  const qrImage = document.getElementById('qrImage');
  const generatedQR = document.getElementById('generatedQR');
  const downloadBtn = document.getElementById('downloadBtn');
  const shareBtn = document.getElementById('shareBtn');
  const resetBtn = document.getElementById('resetBtn');
  const loading = document.getElementById('loading');
  const qrColor = document.getElementById('qrColor');
  const bgColor = document.getElementById('bgColor');
  const sizeSelect = document.getElementById('sizeSelect');
  
  // توليد QR Code
  generateBtn.addEventListener('click', async function() {
    const url = urlInput.value.trim();
    
    if (!url) {
      alert('⚠️ الرجاء إدخال رابط صحيح');
      urlInput.focus();
      return;
    }
    
    // التحقق من صحة الرابط
    if (!isValidUrl(url)) {
      alert('⚠️ الرجاء إدخال رابط صحيح (يجب أن يبدأ بـ http:// أو https://)');
      return;
    }
    
    showLoading();
    
    try {
      // إعداد معلمات QR Code
      const params = new URLSearchParams({
        url: url,
        color: qrColor.value.replace('#', ''),
        bgcolor: bgColor.value.replace('#', ''),
        size: sizeSelect.value
      });
      
      // استدعاء API
      const response = await fetch(`/api/generate?${params}`);
      
      if (!response.ok) {
        throw new Error('فشل في إنشاء QR Code');
      }
      
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      
      // عرض الصورة
      generatedQR.src = imageUrl;
      qrPlaceholder.style.display = 'none';
      qrImage.style.display = 'block';
      
      // إعداد زر التحميل
      downloadBtn.onclick = () => downloadImage(imageUrl, url);
      shareBtn.onclick = () => shareImage(imageUrl);
      
      hideLoading();
      
    } catch (error) {
      hideLoading();
      alert('❌ حدث خطأ: ' + error.message);
      console.error(error);
    }
  });
  
  // دعم Enter في حقل الإدخال
  urlInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      generateBtn.click();
    }
  });
  
  // زر إعادة التعيين
  resetBtn.addEventListener('click', function() {
    urlInput.value = '';
    qrImage.style.display = 'none';
    qrPlaceholder.style.display = 'flex';
    urlInput.focus();
  });
  
  // دالة تحميل الصورة
  function downloadImage(imageUrl, originalUrl) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `qr-code-${getDomain(originalUrl)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // عرض رسالة نجاح
    showNotification('✅ تم تحميل QR Code بنجاح!');
  }
  
  // دالة المشاركة
  async function shareImage(imageUrl) {
    try {
      if (navigator.share) {
        // تحويل blob إلى file
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'qr-code.png', { type: 'image/png' });
        
        await navigator.share({
          files: [file],
          title: 'QR Code',
          text: 'QR Code الذي تم إنشاؤه من الموقع'
        });
      } else {
        // نسخ الرابط إذا لم يكن Share API متاحًا
        await navigator.clipboard.writeText(urlInput.value);
        showNotification('✅ تم نسخ الرابط إلى الحافظة!');
      }
    } catch (error) {
      console.error('مشاركة:', error);
    }
  }
  
  // دوال المساعدة
  function isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }
  
  function getDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace(/^www\./, '');
    } catch (_) {
      return 'qr-code';
    }
  }
  
  function showLoading() {
    loading.style.display = 'block';
    qrPlaceholder.style.display = 'none';
    qrImage.style.display = 'none';
  }
  
  function hideLoading() {
    loading.style.display = 'none';
  }
  
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  // إضافة أنماط للرسوم المتحركة
  const style = document.createElement('style');
  style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
  document.head.appendChild(style);
});