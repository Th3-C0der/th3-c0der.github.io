// Protection measures for website content
document.addEventListener('DOMContentLoaded', function() {
    // Disable right-click only on images and code blocks
    document.addEventListener('contextmenu', function(e) {
        const target = e.target;
        if (target.tagName === 'IMG' || target.tagName === 'PRE' || target.tagName === 'CODE') {
            e.preventDefault();
            return false;
        }
    });

    // Disable text selection only on code blocks
    document.addEventListener('selectstart', function(e) {
        const target = e.target;
        if (target.tagName === 'PRE' || target.tagName === 'CODE') {
            e.preventDefault();
            return false;
        }
    });

    // Disable keyboard shortcuts only on protected content
    document.addEventListener('keydown', function(e) {
        const target = e.target;
        if (target.tagName === 'PRE' || target.tagName === 'CODE') {
            // Prevent Ctrl+S, Ctrl+U, Ctrl+P, Ctrl+Shift+I, F12
            if (
                (e.ctrlKey && (e.key === 's' || e.key === 'u' || e.key === 'p')) ||
                (e.ctrlKey && e.shiftKey && e.key === 'i') ||
                e.key === 'F12'
            ) {
                e.preventDefault();
                return false;
            }
        }
    });

    // Add watermark to images (excluding logo and ads)
    const images = document.getElementsByTagName('img');
    for (let img of images) {
        // Skip the logo image and ad images
        if (img.alt === 'Th3-C0der Logo' || 
            img.parentElement.closest('.adsbygoogle') || 
            img.parentElement.closest('[id*="google_ads"]') ||
            img.parentElement.closest('[class*="ads"]')) continue;
        
        img.style.position = 'relative';
        const watermark = document.createElement('div');
        watermark.style.position = 'absolute';
        watermark.style.bottom = '5px';
        watermark.style.right = '5px';
        watermark.style.color = 'rgba(255, 255, 255, 0.7)';
        watermark.style.fontSize = '12px';
        watermark.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.8)';
        watermark.textContent = '© Th3-C0der';
        img.parentNode.style.position = 'relative';
        img.parentNode.appendChild(watermark);
    }

    // Disable drag and drop only on images and code blocks
    document.addEventListener('dragstart', function(e) {
        const target = e.target;
        if (target.tagName === 'IMG' || target.tagName === 'PRE' || target.tagName === 'CODE') {
            e.preventDefault();
            return false;
        }
    });

    // Add copyright notice to code blocks
    const codeBlocks = document.querySelectorAll('pre, code');
    codeBlocks.forEach(block => {
        const notice = document.createElement('div');
        notice.style.fontSize = '12px';
        notice.style.color = '#666';
        notice.style.marginTop = '5px';
        notice.textContent = '© Th3-C0der - Unauthorized copying prohibited';
        block.parentNode.appendChild(notice);
    });
}); 