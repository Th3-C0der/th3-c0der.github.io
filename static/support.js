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

// Load Supporters
async function loadSupporters() {
    const grid = document.querySelector('.supporters-grid');
    if (!grid) return;
    
    try {
        const response = await fetch("https://idk.skillvox-ai.workers.dev/supporters");
        if (!response.ok) return; // Silent fail if worker not updated yet
        
        const supporters = await response.json();
        
        if (!Array.isArray(supporters) || supporters.length === 0) return; // Keep placeholder if empty
        
        grid.innerHTML = ''; // Clear placeholder
        
        supporters.forEach(supporter => {
            const hasGithub = supporter.github && supporter.github.trim() !== '';
            let githubUsername = '';
            
            if (hasGithub) {
                // Clean up github input (remove @ or full url)
                githubUsername = supporter.github.replace('https://github.com/', '').replace('@', '').trim();
            }
            
            const avatarHtml = hasGithub 
                ? `<img src="https://github.com/${githubUsername}.png?size=100" alt="${supporter.name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`
                : `<i class="fas fa-user"></i>`;
                
            const reviewHtml = supporter.review && supporter.review.trim() !== ''
                ? `<p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.5rem; font-style: italic;">"${supporter.review}"</p>`
                : ``;

            const card = document.createElement('div');
            card.className = 'supporter-card';
            card.style.cssText = 'background: var(--bg-glass); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: var(--radius-sm); padding: 1.5rem; display: flex; align-items: flex-start; gap: 1rem; text-align: left; transition: transform 0.3s ease;';
            card.onmouseover = () => card.style.transform = 'translateY(-5px)';
            card.onmouseout = () => card.style.transform = 'translateY(0)';
            
            card.innerHTML = `
                <div class="avatar" style="width: 50px; height: 50px; border-radius: 50%; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 1.5rem; flex-shrink: 0; overflow: hidden;">
                    ${avatarHtml}
                </div>
                <div class="info" style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem;">
                        <h4 style="color: var(--text-primary); font-family: var(--font-secondary); font-size: 1rem; margin: 0;">${supporter.name}</h4>
                        <span style="color: var(--accent-primary); font-size: 0.85rem; font-weight: 600;">${supporter.currency === 'INR' ? '₹' : '$'}${supporter.amount}</span>
                    </div>
                    ${hasGithub ? `<a href="https://github.com/${githubUsername}" target="_blank" style="color: var(--text-muted); font-size: 0.75rem; text-decoration: none;"><i class="fab fa-github"></i> @${githubUsername}</a>` : ''}
                    ${reviewHtml}
                </div>
            `;
            
            grid.appendChild(card);
        });
        
    } catch (err) {
        console.error("Failed to load Recent Supporters", err);
    }
}

// Initial render
renderAmounts();
loadSupporters();

// Razorpay Integration Form Submit
document.getElementById('donation-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('donor-name').value;
    const email = document.getElementById('donor-email').value;
    const github = document.getElementById('donor-github').value;
    const review = document.getElementById('donor-review').value;

    // In paise or cents
    const amountInSubunits = selectedAmount * 100;
    const donateBtn = e.target.querySelector('.donate-btn');
    const originalBtnText = donateBtn.innerHTML;

    try {
        // Change button state to loading
        donateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        donateBtn.disabled = true;

        // 1. Ask Cloudflare Worker to create an order
        const orderResponse = await fetch("https://idk.skillvox-ai.workers.dev/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                amount: amountInSubunits,
                currency: currentCurrency
            })
        });

        if (!orderResponse.ok) {
            throw new Error(`Failed to fetch order details (HTTP ${orderResponse.status})`);
        }

        const orderData = await orderResponse.json();

        if (orderData.error) {
            throw new Error(orderData.error.description || orderData.error);
        }

        // 2. Initialize Razorpay with the generated order_id
        var options = {
            "key": "rzp_live_T9nh2yCUFQfY2f", // Add your Razorpay Key ID here
            "amount": amountInSubunits,
            "currency": currentCurrency,
            "name": "Th3-C0der",
            "description": "Donation",
            "image": "https://img1.wsimg.com/isteam/ip/fe671351-6f24-41a1-9382-e1e502b566f0/1000121535.png",
            "order_id": orderData.id, // ID returned from our Cloudflare Worker!
            "handler": async function (response) {
                // Change button state to saving
                donateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                
                try {
                    await fetch("https://idk.skillvox-ai.workers.dev/verify-payment", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            paymentId: response.razorpay_payment_id,
                            orderId: response.razorpay_order_id,
                            signature: response.razorpay_signature,
                            name: name,
                            github: github,
                            review: document.getElementById('leave-review').checked ? review : "",
                            amount: selectedAmount,
                            currency: currentCurrency
                        })
                    });
                    
                    alert("Thank you for your support, " + name + "!");
                    
                    // Reset form and reload supporters
                    document.getElementById('donation-form').reset();
                    document.querySelector('.review-group').style.display = 'none';
                    donateBtn.innerHTML = originalBtnText;
                    
                    loadSupporters(); // Refresh Supporters
                } catch (e) {
                    console.error("Failed to save to Supporters List", e);
                    alert("Payment successful! (But we couldn't automatically add you to the Supporters list right now).");
                    donateBtn.innerHTML = originalBtnText;
                }
            },
            "prefill": {
                "name": name,
                "email": email || undefined
            },
            "theme": {
                "color": "#00ff9d" // Matches accent color
            }
        };

        var rzp1 = new Razorpay(options);
        rzp1.on('payment.failed', function (response) {
            alert("Payment Failed. Reason: " + response.error.description);
        });

        rzp1.open();

    } catch (error) {
        alert("Could not initialize payment: " + error.message);
        console.error(error);
    } finally {
        // Reset button state
        donateBtn.innerHTML = originalBtnText;
        donateBtn.disabled = false;
    }
});
