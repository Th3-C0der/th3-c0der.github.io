const currencyToggleBtns = document.querySelectorAll('.toggle-btn');
const amountGrid = document.getElementById('amount-grid');
const customAmountInput = document.getElementById('custom-amount-input');
const currencySymbol = document.querySelector('.currency-symbol');
const donateBtnText = document.getElementById('donate-btn-text');
const leaveReviewCheckbox = document.getElementById('leave-review');
const reviewGroup = document.querySelector('.review-group');
const reviewTextarea = document.getElementById('donor-review');
const charCount = document.querySelector('.char-count');

const amounts = {
    INR: [100, 500, 1000, 2500, 5000],
    USD: [5, 10, 25, 50, 100]
};

const symbols = {
    INR: '₹',
    USD: '$'
};

let currentCurrency = 'INR';
let selectedAmount = 500;

function renderAmounts() {
    amountGrid.innerHTML = '';
    const currentAmounts = amounts[currentCurrency];
    const sym = symbols[currentCurrency];

    currentAmounts.forEach(amt => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `amount-btn ${amt === selectedAmount ? 'active' : ''}`;
        btn.textContent = `${sym}${amt}`;
        btn.onclick = () => selectAmount(amt);
        amountGrid.appendChild(btn);
    });

    currencySymbol.textContent = sym;
    updateDonateButton();
}

function selectAmount(amt) {
    selectedAmount = amt;
    customAmountInput.value = '';
    customAmountInput.classList.remove('active');
    renderAmounts();
}

currencyToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        currencyToggleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCurrency = btn.dataset.currency;

        selectedAmount = currentCurrency === 'INR' ? 500 : 10;
        customAmountInput.value = '';
        renderAmounts();
    });
});

customAmountInput.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val > 0) {
        selectedAmount = val;
        document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
        customAmountInput.classList.add('active');
    } else {
        selectedAmount = currentCurrency === 'INR' ? 500 : 10;
        customAmountInput.classList.remove('active');
        renderAmounts();
    }
    updateDonateButton();
});

function updateDonateButton() {
    const sym = symbols[currentCurrency];
    donateBtnText.textContent = `Donate ${sym}${selectedAmount}`;
}

leaveReviewCheckbox.addEventListener('change', (e) => {
    if (e.target.checked) {
        reviewGroup.style.display = 'block';
    } else {
        reviewGroup.style.display = 'none';
        reviewTextarea.value = '';
        charCount.textContent = '0/280';
    }
});

reviewTextarea.addEventListener('input', (e) => {
    const len = e.target.value.length;
    charCount.textContent = `${len}/280`;
});

// Load Supporters with Pagination & Zero-Lag Lazy Loading
let currentSupportersPage = 1;
const SUPPORTERS_PAGE_SIZE = 12;
let hasMoreSupporters = false;
let isLoadingSupporters = false;

async function loadSupporters(page = 1, append = false) {
    const grid = document.querySelector('.supporters-grid');
    const loadMoreContainer = document.getElementById('load-more-container');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const countBadge = document.getElementById('supporters-count');
    
    if (!grid) return;
    if (isLoadingSupporters) return;
    
    isLoadingSupporters = true;
    if (loadMoreBtn && append) {
        loadMoreBtn.disabled = true;
        loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    }
    
    try {
        const response = await fetch(`https://idk.skillvox-ai.workers.dev/supporters?limit=${SUPPORTERS_PAGE_SIZE}&page=${page}`);
        if (!response.ok) return;
        
        const data = await response.json();
        
        // Supports both new paginated response { supporters, total, hasMore } and legacy array [...]
        let supporters = [];
        let totalCount = 0;
        
        if (Array.isArray(data)) {
            // Legacy response: slice client-side if needed
            const start = (page - 1) * SUPPORTERS_PAGE_SIZE;
            supporters = data.slice(start, start + SUPPORTERS_PAGE_SIZE);
            totalCount = data.length;
            hasMoreSupporters = start + SUPPORTERS_PAGE_SIZE < data.length;
        } else if (data && Array.isArray(data.supporters)) {
            supporters = data.supporters;
            totalCount = data.total || supporters.length;
            hasMoreSupporters = Boolean(data.hasMore);
        }
        
        if (!append) {
            grid.innerHTML = ''; // Clear placeholder or previous items on fresh load
        }
        
        if (countBadge && totalCount > 0) {
            countBadge.textContent = `${totalCount} Supporter${totalCount === 1 ? '' : 's'}`;
            countBadge.style.display = 'inline-flex';
        }
        
        if (supporters.length === 0 && !append) {
            grid.innerHTML = `
                <div class="supporter-card" style="background: var(--bg-glass); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: var(--radius-sm); padding: 1.5rem; display: flex; align-items: center; gap: 1rem; text-align: left;">
                    <div class="avatar" style="width: 50px; height: 50px; border-radius: 50%; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 1.5rem;">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="info">
                        <h4 style="color: var(--text-primary); font-family: var(--font-secondary); font-size: 1rem; margin-bottom: 0.2rem;">Be the first!</h4>
                        <p style="color: var(--accent-primary); font-size: 0.85rem; font-weight: 600;">₹500</p>
                    </div>
                </div>
            `;
            if (loadMoreContainer) loadMoreContainer.style.display = 'none';
            return;
        }
        
        supporters.forEach(supporter => {
            const hasGithub = supporter.github && supporter.github.trim() !== '' && supporter.github.trim().toLowerCase() !== 'male' && supporter.github.trim().toLowerCase() !== 'upi';
            let githubUsername = '';
            
            if (hasGithub) {
                // Clean up github input (remove @ or full url)
                githubUsername = supporter.github.replace(/https?:\/\/github\.com\//, '').replace('@', '').trim();
            }
            
            // Format donation date if available
            let dateStr = '';
            if (supporter.date) {
                try {
                    const d = new Date(supporter.date);
                    dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                } catch (e) {}
            }
            
            const avatarHtml = hasGithub && githubUsername
                ? `<img src="https://github.com/${githubUsername}.png?size=100" alt="${supporter.name}" loading="lazy" onerror="this.onerror=null;this.parentElement.innerHTML='<i class=\\\'fas fa-user\\\'></i>';" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`
                : `<i class="fas fa-user"></i>`;
                
            const reviewHtml = supporter.review && supporter.review.trim() !== ''
                ? `<p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.5rem; font-style: italic; word-break: break-word;">"${supporter.review}"</p>`
                : ``;

            const card = document.createElement('div');
            card.className = 'supporter-card';
            card.style.cssText = 'background: var(--bg-glass); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: var(--radius-sm); padding: 1.5rem; display: flex; align-items: flex-start; gap: 1rem; text-align: left; transition: transform 0.3s ease, border-color 0.3s ease;';
            card.onmouseover = () => {
                card.style.transform = 'translateY(-5px)';
                card.style.borderColor = 'rgba(0, 255, 157, 0.3)';
            };
            card.onmouseout = () => {
                card.style.transform = 'translateY(0)';
                card.style.borderColor = 'rgba(255, 255, 255, 0.05)';
            };
            
            card.innerHTML = `
                <div class="avatar" style="width: 50px; height: 50px; border-radius: 50%; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 1.5rem; flex-shrink: 0; overflow: hidden;">
                    ${avatarHtml}
                </div>
                <div class="info" style="flex: 1; min-width: 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem; gap: 0.5rem;">
                        <h4 style="color: var(--text-primary); font-family: var(--font-secondary); font-size: 1rem; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${supporter.name}</h4>
                        <span style="color: var(--accent-primary); font-size: 0.85rem; font-weight: 600; white-space: nowrap;">${supporter.currency === 'INR' ? '₹' : '$'}${supporter.amount}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;">
                        ${hasGithub && githubUsername ? `<a href="https://github.com/${githubUsername}" target="_blank" rel="noopener noreferrer" style="color: var(--text-muted); font-size: 0.75rem; text-decoration: none;"><i class="fab fa-github"></i> @${githubUsername}</a>` : '<span></span>'}
                        ${dateStr ? `<span style="color: var(--text-muted); font-size: 0.7rem; opacity: 0.7;">${dateStr}</span>` : ''}
                    </div>
                    ${reviewHtml}
                </div>
            `;
            
            grid.appendChild(card);
        });
        
        // Show/hide Load More button
        if (loadMoreContainer) {
            loadMoreContainer.style.display = hasMoreSupporters ? 'flex' : 'none';
        }
        
    } catch (err) {
        console.error("Failed to load Recent Supporters", err);
    } finally {
        isLoadingSupporters = false;
        if (loadMoreBtn) {
            loadMoreBtn.disabled = false;
            loadMoreBtn.innerHTML = '<span>Load More Supporters</span> <i class="fas fa-chevron-down"></i>';
        }
    }
}

// Initial render
renderAmounts();
loadSupporters(1, false);

// Wire Load More Button
const loadMoreBtn = document.getElementById('load-more-btn');
if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
        if (!isLoadingSupporters && hasMoreSupporters) {
            currentSupportersPage++;
            loadSupporters(currentSupportersPage, true);
        }
    });
}

// Razorpay Integration Form Submit
document.getElementById('donation-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('donor-name').value.trim();
    const email = document.getElementById('donor-email').value.trim();
    const github = document.getElementById('donor-github').value.trim();
    const review = document.getElementById('donor-review').value.trim();
    const isReviewChecked = document.getElementById('leave-review').checked;
    const finalReview = isReviewChecked ? review : "";

    // In paise or cents
    const amountInSubunits = selectedAmount * 100;
    const donateBtn = e.target.querySelector('.donate-btn');
    const originalBtnText = donateBtn.innerHTML;

    try {
        // Change button state to loading
        donateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        donateBtn.disabled = true;

        // 1. Ask Cloudflare Worker to create an order - also pass notes for redundant Razorpay backup
        const orderResponse = await fetch("https://idk.skillvox-ai.workers.dev/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                amount: amountInSubunits,
                currency: currentCurrency,
                name: name,
                github: github,
                review: finalReview
            })
        });

        if (!orderResponse.ok) {
            throw new Error(`Failed to fetch order details (HTTP ${orderResponse.status})`);
        }

        const orderData = await orderResponse.json();

        if (orderData.error) {
            throw new Error(orderData.error.description || orderData.error);
        }

        // 2. Initialize Razorpay with the generated order_id & backup notes
        var options = {
            "key": "rzp_live_Td0aBwnKAGFCei",
            "amount": amountInSubunits,
            "currency": currentCurrency,
            "name": "Th3-C0der",
            "description": "Donation to Th3-C0der",
            "image": "https://img1.wsimg.com/isteam/ip/fe671351-6f24-41a1-9382-e1e502b566f0/1000121535.png",
            "order_id": orderData.id,
            "notes": {
                "donor_name": name,
                "github": github,
                "review": finalReview
            },
            "handler": async function (response) {
                donateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                
                try {
                    const verifyResponse = await fetch("https://idk.skillvox-ai.workers.dev/verify-payment", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            paymentId: response.razorpay_payment_id,
                            orderId: response.razorpay_order_id,
                            signature: response.razorpay_signature,
                            name: name,
                            github: github,
                            review: finalReview,
                            amount: selectedAmount,
                            currency: currentCurrency
                        })
                    });
                    
                    const verifyData = await verifyResponse.json();
                    if (!verifyResponse.ok || verifyData.error) {
                        throw new Error(verifyData.error || "Payment verification failed");
                    }
                    
                    alert("Thank you for your generous support, " + name + "! ❤️");
                    
                    // Reset form and reload supporters from page 1
                    document.getElementById('donation-form').reset();
                    document.querySelector('.review-group').style.display = 'none';
                    donateBtn.innerHTML = originalBtnText;
                    
                    currentSupportersPage = 1;
                    loadSupporters(1, false); // Refresh Supporters Wall
                } catch (e) {
                    console.error("Failed to save to Supporters List", e);
                    alert("Payment successful! Your contribution was securely captured on Razorpay. (If it does not appear on the wall immediately, it will reflect shortly).");
                    donateBtn.innerHTML = originalBtnText;
                }
            },
            "prefill": {
                "name": name,
                "email": email || undefined
            },
            "theme": {
                "color": "#00ff9d"
            }
        };

        var rzp1 = new Razorpay(options);
        rzp1.on('payment.failed', function (response) {
            alert("Payment Failed. Reason: " + (response.error.description || response.error.reason));
        });

        rzp1.open();

    } catch (error) {
        alert("Could not initialize payment: " + error.message);
        console.error(error);
    } finally {
        donateBtn.innerHTML = originalBtnText;
        donateBtn.disabled = false;
    }
});
