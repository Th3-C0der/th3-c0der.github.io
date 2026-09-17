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

// Load Supporters with High-Speed In-Memory Ranking & Lazy Loading
let currentSupportersPage = 1;
const SUPPORTERS_PAGE_SIZE = 12;
let hasMoreSupporters = false;
let isLoadingSupporters = false;
let currentSort = 'recent'; // 'recent' | 'top' | 'reviews'
let cachedAllSupporters = null; // In-memory cache for instant 0ms tab switching

// Helper to normalize amount for fair USD/INR top ranking comparison
function getRankWeight(item) {
    const amt = Number(item.amount) || 0;
    return item.currency === 'USD' ? amt * 85 : amt;
}

// Fetch all supporters from API and cache in memory (handles pagination if capped)
async function fetchSupportersFromApi() {
    try {
        let all = [];
        let page = 1;
        let hasMore = true;
        
        while (hasMore && page <= 20) {
            const response = await fetch(`https://idk.skillvox-ai.workers.dev/supporters?limit=1000&all=true&page=${page}`);
            if (!response.ok) break;
            const data = await response.json();
            
            if (Array.isArray(data)) {
                all = data;
                break;
            } else if (data && Array.isArray(data.supporters)) {
                all = all.concat(data.supporters);
                const totalReported = data.total || 0;
                // If we reached total reported, or hasMore is false, stop
                if (all.length >= totalReported || !data.hasMore || data.supporters.length === 0) {
                    hasMore = false;
                } else {
                    page++;
                }
            } else {
                break;
            }
        }
        return all;
    } catch (e) {
        console.error("Error fetching supporters:", e);
        return [];
    }
}

let scrollObserver = null;

function setupInfiniteScroll() {
    const sentinel = document.getElementById('scroll-sentinel');
    if (!sentinel) return;

    if (scrollObserver) {
        scrollObserver.disconnect();
    }

    scrollObserver = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMoreSupporters && !isLoadingSupporters) {
            currentSupportersPage++;
            loadSupporters(currentSupportersPage, true);
        }
    }, {
        root: null,
        rootMargin: '300px', // Preload 300px before reaching the bottom
        threshold: 0.05
    });

    scrollObserver.observe(sentinel);
}

async function loadSupporters(page = 1, append = false) {
    const grid = document.querySelector('.supporters-grid');
    const infiniteLoader = document.getElementById('infinite-loader');
    const endOfSupporters = document.getElementById('end-of-supporters');
    const countBadge = document.getElementById('supporters-count');
    
    if (!grid) return;
    if (isLoadingSupporters) return;
    
    isLoadingSupporters = true;
    if (infiniteLoader && append) {
        infiniteLoader.style.display = 'inline-flex';
    }
    if (endOfSupporters && !append) {
        endOfSupporters.style.display = 'none';
    }
    
    try {
        // 1. Ensure we have the supporters list loaded
        if (!cachedAllSupporters) {
            cachedAllSupporters = await fetchSupportersFromApi();
        }
        
        // 2. Sort or Filter based on current active tab
        let filtered = [...cachedAllSupporters];
        
        if (currentSort === 'top') {
            filtered.sort((a, b) => getRankWeight(b) - getRankWeight(a));
        } else if (currentSort === 'reviews') {
            filtered = filtered.filter(s => s.review && s.review.trim() !== '');
            filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } else {
            // 'recent'
            filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
        
        const totalCount = filtered.length;
        
        // 3. Slice page items
        const startIndex = append ? (page - 1) * SUPPORTERS_PAGE_SIZE : 0;
        const endIndex = page * SUPPORTERS_PAGE_SIZE;
        const supportersToRender = filtered.slice(startIndex, endIndex);
        hasMoreSupporters = endIndex < totalCount;
        
        if (!append) {
            grid.innerHTML = ''; // Clear previous items on tab change or initial load
        }
        
        // 4. Update Header Count Badge
        if (countBadge) {
            if (totalCount > 0) {
                let badgeLabel = currentSort === 'reviews' 
                    ? `${totalCount} Review${totalCount === 1 ? '' : 's'}`
                    : `${totalCount} Supporter${totalCount === 1 ? '' : 's'}`;
                countBadge.textContent = badgeLabel;
                countBadge.style.display = 'inline-flex';
            } else {
                countBadge.style.display = 'none';
            }
        }
        
        // 5. Handle Empty State
        if (filtered.length === 0) {
            let emptyMsg = "No reviews yet. Be the first to leave one!";
            let emptyIcon = "far fa-comment-dots";
            if (currentSort !== 'reviews') {
                emptyMsg = "Be the first to support!";
                emptyIcon = "fas fa-heart";
            }
            grid.innerHTML = `
                <div class="supporters-empty">
                    <i class="${emptyIcon}"></i>
                    <p>${emptyMsg}</p>
                </div>
            `;
            if (infiniteLoader) infiniteLoader.style.display = 'none';
            if (endOfSupporters) endOfSupporters.style.display = 'none';
            return;
        }
        
        // 6. Render Cards
        supportersToRender.forEach((supporter, idx) => {
            const globalIndex = startIndex + idx;
            const hasGithub = supporter.github && supporter.github.trim() !== '' && 
                              supporter.github.trim().toLowerCase() !== 'male' && 
                              supporter.github.trim().toLowerCase() !== 'upi';
            let githubUsername = '';
            
            if (hasGithub) {
                githubUsername = supporter.github.replace(/https?:\/\/github\.com\//, '').replace('@', '').trim();
            }
            
            // Format donation date
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
                ? `<div class="donor-review"><i class="fas fa-quote-left"></i> ${supporter.review}</div>`
                : ``;

            // Calculate Ranking Badge (if in 'top' sort mode)
            let rankClass = '';
            let rankBadgeHtml = '';
            if (currentSort === 'top') {
                const globalRank = globalIndex + 1;
                if (globalRank === 1) {
                    rankClass = 'rank-1';
                    rankBadgeHtml = `<div class="rank-badge badge-gold"><i class="fas fa-crown"></i> 1st Top Donor</div>`;
                } else if (globalRank === 2) {
                    rankClass = 'rank-2';
                    rankBadgeHtml = `<div class="rank-badge badge-silver"><i class="fas fa-medal"></i> 2nd Top Donor</div>`;
                } else if (globalRank === 3) {
                    rankClass = 'rank-3';
                    rankBadgeHtml = `<div class="rank-badge badge-bronze"><i class="fas fa-medal"></i> 3rd Top Donor</div>`;
                } else {
                    rankBadgeHtml = `<div class="rank-badge badge-other">#${globalRank} Top Supporter</div>`;
                }
            }

            const card = document.createElement('div');
            card.className = `supporter-card ${rankClass}`;
            
            card.innerHTML = `
                ${rankBadgeHtml}
                <div class="supporter-card-top">
                    <div class="avatar">
                        ${avatarHtml}
                    </div>
                    <div class="info">
                        <div class="name-row">
                            <h4 class="donor-name" title="${supporter.name}">${supporter.name}</h4>
                            <span class="donor-amount">${supporter.currency === 'USD' ? '$' : '₹'}${supporter.amount}</span>
                        </div>
                        <div class="meta-row">
                            ${hasGithub && githubUsername ? `<a href="https://github.com/${githubUsername}" target="_blank" rel="noopener noreferrer" class="donor-github"><i class="fab fa-github"></i> @${githubUsername}</a>` : '<span></span>'}
                            ${dateStr ? `<span class="donor-date">${dateStr}</span>` : ''}
                        </div>
                    </div>
                </div>
                ${reviewHtml}
            `;
            
            grid.appendChild(card);
        });
        
        // 7. Auto-scroll UI indicators
        if (infiniteLoader) {
            infiniteLoader.style.display = 'none';
        }
        if (endOfSupporters) {
            endOfSupporters.style.display = (!hasMoreSupporters && totalCount > SUPPORTERS_PAGE_SIZE) ? 'inline-flex' : 'none';
        }
        
    } catch (err) {
        console.error("Failed to load Supporters", err);
    } finally {
        isLoadingSupporters = false;
        if (infiniteLoader) {
            infiniteLoader.style.display = 'none';
        }
    }
}

// Initial render
renderAmounts();
loadSupporters(1, false);
setupInfiniteScroll();

// Wire Ranking / Filter Tabs
const tabButtons = document.querySelectorAll('.supporter-tab-btn');
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (isLoadingSupporters) return;
        const sortType = btn.dataset.sort;
        if (sortType === currentSort) return;

        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        currentSort = sortType;
        currentSupportersPage = 1;
        loadSupporters(1, false);
    });
});

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
                    
                    // Reset form, clear cache, and reload fresh supporters list from worker
                    document.getElementById('donation-form').reset();
                    document.querySelector('.review-group').style.display = 'none';
                    donateBtn.innerHTML = originalBtnText;
                    
                    cachedAllSupporters = null; // Clear cache so new donor is fetched immediately
                    currentSupportersPage = 1;
                    loadSupporters(1, false); // Refresh Supporters Wall with new live count
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
