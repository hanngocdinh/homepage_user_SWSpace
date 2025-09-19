// SWSpace Co-Working Management System
// Main JavaScript functionality with AI optimization

class SWSpaceManager {
    constructor() {
        this.spaces = [];
        this.bookings = [];
        this.users = [];
        this.analytics = {
            utilization: [],
            revenue: [],
            realtime: {
                currentUsage: 0,
                availableNow: 0,
                todayRevenue: 0
            }
        };
        this.aiEngine = new AIOptimizer();
        
        this.init();
    }

    init() {
        this.loadSpaces();
        this.setupEventListeners();
        this.initializeCharts();
        this.startRealtimeUpdates();
        this.animateCounters();
    }

    // Initialize sample spaces
    loadSpaces() {
        this.spaces = [
            {
                id: 'A1',
                name: 'Bàn làm việc A1',
                type: 'desk',
                status: 'available',
                price: 50000,
                capacity: 1,
                amenities: ['WiFi', 'Ổ cắm', 'Ánh sáng tự nhiên'],
                location: 'Tầng 1, Khu A'
            },
            {
                id: 'A2',
                name: 'Phòng họp A2',
                type: 'meeting-room',
                status: 'occupied',
                price: 100000,
                capacity: 8,
                amenities: ['Projector', 'Whiteboard', 'Video Conference'],
                location: 'Tầng 2, Khu A',
                bookedUntil: '16:00'
            },
            {
                id: 'B1',
                name: 'Văn phòng riêng B1',
                type: 'private-office',
                status: 'available',
                price: 200000,
                capacity: 4,
                amenities: ['Tủ khóa', 'Điều hòa', 'Cửa sổ'],
                location: 'Tầng 2, Khu B'
            },
            {
                id: 'C1',
                name: 'Khu lounge C1',
                type: 'lounge',
                status: 'maintenance',
                price: 30000,
                capacity: 10,
                amenities: ['Sofa', 'TV', 'Máy pha cà phê'],
                location: 'Tầng 1, Khu C',
                maintenanceNote: 'Sửa chữa điều hòa'
            }
        ];

        this.renderSpaces();
        this.updateRealTimeStats();
    }

    // Setup event listeners
    setupEventListeners() {
        // Navigation toggle for mobile
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
                navMenu.classList.remove('active');
            });
        });

        // Booking form submission
        const bookingForm = document.getElementById('bookingForm');
        if (bookingForm) {
            bookingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleBookingSubmission(e);
            });
        }

        // Space type change for pricing
        const spaceTypeSelect = document.getElementById('spaceType');
        if (spaceTypeSelect) {
            spaceTypeSelect.addEventListener('change', this.updatePricing.bind(this));
        }

        // Date input change
        const dateInput = document.getElementById('bookingDate');
        if (dateInput) {
            dateInput.min = new Date().toISOString().split('T')[0];
        }
    }

    // Render spaces in the spaces section
    renderSpaces() {
        const container = document.getElementById('spacesContainer');
        if (!container) return;

        container.innerHTML = '';
        
        this.spaces.forEach(space => {
            const spaceElement = this.createSpaceElement(space);
            container.appendChild(spaceElement);
        });
    }

    // Create individual space element
    createSpaceElement(space) {
        const div = document.createElement('div');
        div.className = 'space-item';
        div.innerHTML = `
            <div class="space-header">
                <h3 class="space-name">${space.name}</h3>
                <span class="space-status status-${space.status}">
                    ${this.getStatusText(space.status)}
                </span>
            </div>
            <div class="space-details">
                <div class="space-detail">
                    <span>Loại:</span>
                    <span>${this.getTypeText(space.type)}</span>
                </div>
                <div class="space-detail">
                    <span>Sức chứa:</span>
                    <span>${space.capacity} người</span>
                </div>
                <div class="space-detail">
                    <span>Giá:</span>
                    <span>${this.formatCurrency(space.price)}/ngày</span>
                </div>
                <div class="space-detail">
                    <span>Vị trí:</span>
                    <span>${space.location}</span>
                </div>
                ${space.bookedUntil ? `
                    <div class="space-detail">
                        <span>Đặt đến:</span>
                        <span>${space.bookedUntil}</span>
                    </div>
                ` : ''}
                ${space.maintenanceNote ? `
                    <div class="space-detail">
                        <span>Ghi chú:</span>
                        <span>${space.maintenanceNote}</span>
                    </div>
                ` : ''}
            </div>
            <div class="space-actions">
                ${space.status === 'available' ? `
                    <button class="btn btn-primary btn-sm" onclick="swspace.bookSpace('${space.id}')">
                        <i class="fas fa-calendar-plus"></i> Đặt ngay
                    </button>
                ` : ''}
                <button class="btn btn-secondary btn-sm" onclick="swspace.viewSpaceDetails('${space.id}')">
                    <i class="fas fa-info-circle"></i> Chi tiết
                </button>
            </div>
        `;

        return div;
    }

    // Helper functions
    getStatusText(status) {
        const statusMap = {
            'available': 'Có sẵn',
            'occupied': 'Đã đặt',
            'maintenance': 'Bảo trì'
        };
        return statusMap[status] || status;
    }

    getTypeText(type) {
        const typeMap = {
            'desk': 'Bàn làm việc',
            'meeting-room': 'Phòng họp',
            'private-office': 'Văn phòng riêng',
            'lounge': 'Khu lounge'
        };
        return typeMap[type] || type;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    // Booking functionality
    handleBookingSubmission(event) {
        const formData = new FormData(event.target);
        const bookingData = {
            id: 'BK' + Date.now(),
            userName: document.getElementById('userName').value,
            userEmail: document.getElementById('userEmail').value,
            date: document.getElementById('bookingDate').value,
            timeSlot: document.getElementById('timeSlot').value,
            spaceType: document.getElementById('spaceType').value,
            timestamp: new Date(),
            status: 'confirmed'
        };

        // Calculate pricing with AI optimization
        const pricing = this.aiEngine.calculateOptimalPricing(bookingData);
        bookingData.pricing = pricing;

        // Add booking
        this.bookings.push(bookingData);
        
        // Show success message
        this.showNotification('Đặt chỗ thành công! Chúng tôi sẽ liên hệ với bạn sớm.', 'success');
        
        // Reset form
        event.target.reset();
        document.getElementById('pricingInfo').style.display = 'none';

        // Update analytics
        this.updateAnalytics();
    }

    updatePricing() {
        const spaceType = document.getElementById('spaceType');
        const pricingInfo = document.getElementById('pricingInfo');
        const basePrice = document.getElementById('basePrice');
        const aiDiscount = document.getElementById('aiDiscount');
        const totalPrice = document.getElementById('totalPrice');

        if (!spaceType.value) {
            pricingInfo.style.display = 'none';
            return;
        }

        const selectedOption = spaceType.selectedOptions[0];
        const price = parseInt(selectedOption.dataset.price);
        
        // Calculate AI discount
        const discount = this.aiEngine.calculateDiscount({
            spaceType: spaceType.value,
            date: document.getElementById('bookingDate').value,
            timeSlot: document.getElementById('timeSlot').value
        });

        const discountAmount = Math.floor(price * discount / 100);
        const finalPrice = price - discountAmount;

        basePrice.textContent = this.formatCurrency(price);
        aiDiscount.textContent = `-${this.formatCurrency(discountAmount)} (${discount}%)`;
        totalPrice.textContent = this.formatCurrency(finalPrice);
        
        pricingInfo.style.display = 'block';
    }

    // Space management functions
    bookSpace(spaceId) {
        const space = this.spaces.find(s => s.id === spaceId);
        if (space && space.status === 'available') {
            this.openBookingModal(space);
        }
    }

    viewSpaceDetails(spaceId) {
        const space = this.spaces.find(s => s.id === spaceId);
        if (space) {
            alert(`Chi tiết ${space.name}:\n\n` +
                  `Loại: ${this.getTypeText(space.type)}\n` +
                  `Sức chứa: ${space.capacity} người\n` +
                  `Giá: ${this.formatCurrency(space.price)}/ngày\n` +
                  `Vị trí: ${space.location}\n` +
                  `Tiện ích: ${space.amenities.join(', ')}\n` +
                  `Trạng thái: ${this.getStatusText(space.status)}`);
        }
    }

    filterSpaces() {
        const filter = document.getElementById('spaceFilter').value;
        const spaces = document.querySelectorAll('.space-item');
        
        spaces.forEach(space => {
            if (filter === 'all') {
                space.style.display = 'block';
            } else {
                const status = space.querySelector('.space-status').className;
                space.style.display = status.includes(filter) ? 'block' : 'none';
            }
        });
    }

    changeView(viewType) {
        const buttons = document.querySelectorAll('.view-btn');
        const container = document.getElementById('spacesContainer');
        
        buttons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-view="${viewType}"]`).classList.add('active');
        
        container.className = viewType === 'grid' ? 'spaces-grid' : 'spaces-list';
    }

    addNewSpace() {
        // This would typically open a form to add new spaces
        this.showNotification('Tính năng thêm không gian mới đang được phát triển!', 'info');
    }

    // Modal functions
    openBookingModal(space = null) {
        const modal = document.getElementById('bookingModal');
        const availableSpaces = document.getElementById('availableSpaces');
        
        if (space) {
            document.getElementById('spaceType').value = space.type;
            this.updatePricing();
        }
        
        // Load available spaces in modal
        availableSpaces.innerHTML = '';
        this.spaces.filter(s => s.status === 'available').forEach(s => {
            const spaceOption = document.createElement('div');
            spaceOption.className = 'space-option';
            spaceOption.innerHTML = `
                <h4>${s.name}</h4>
                <p>${this.getTypeText(s.type)}</p>
                <p>${this.formatCurrency(s.price)}/ngày</p>
            `;
            spaceOption.addEventListener('click', () => {
                document.querySelectorAll('.space-option').forEach(opt => 
                    opt.classList.remove('selected'));
                spaceOption.classList.add('selected');
                document.getElementById('spaceType').value = s.type;
                this.updatePricing();
            });
            availableSpaces.appendChild(spaceOption);
        });
        
        modal.style.display = 'flex';
    }

    closeBookingModal() {
        document.getElementById('bookingModal').style.display = 'none';
    }

    // AI Recommendations
    getAIRecommendation() {
        const recommendations = this.aiEngine.generateRecommendations();
        const container = document.getElementById('aiRecommendation');
        
        container.innerHTML = `
            <div class="recommendation-item">
                <h4><i class="fas fa-star"></i> Gợi ý của AI</h4>
                <p><strong>Không gian phù hợp nhất:</strong> ${recommendations.bestSpace.name}</p>
                <p><strong>Thời gian tối ưu:</strong> ${recommendations.optimalTime}</p>
                <p><strong>Giá ưu đãi:</strong> ${this.formatCurrency(recommendations.discountedPrice)}</p>
                <p><strong>Lý do:</strong> ${recommendations.reason}</p>
                <button class="btn btn-primary btn-sm" onclick="swspace.bookSpace('${recommendations.bestSpace.id}')">
                    Đặt ngay
                </button>
            </div>
        `;
        
        container.style.display = 'block';
    }

    // Analytics and Charts
    initializeCharts() {
        this.initUtilizationChart();
        this.initRevenueChart();
    }

    initUtilizationChart() {
        const ctx = document.getElementById('utilizationChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Đang sử dụng', 'Có sẵn', 'Bảo trì'],
                datasets: [{
                    data: [67, 83, 5],
                    backgroundColor: ['#ef4444', '#22c55e', '#f59e0b'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    initRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
                datasets: [{
                    label: 'Doanh thu (triệu VND)',
                    data: [12, 15, 18, 14, 10, 8, 6],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Real-time updates
    startRealtimeUpdates() {
        setInterval(() => {
            this.updateRealTimeStats();
            this.simulateSpaceChanges();
        }, 30000); // Update every 30 seconds
    }

    updateRealTimeStats() {
        const occupied = this.spaces.filter(s => s.status === 'occupied').length;
        const available = this.spaces.filter(s => s.status === 'available').length;
        const revenue = this.calculateTodayRevenue();

        document.getElementById('currentUsage').textContent = occupied;
        document.getElementById('availableNow').textContent = available;
        document.getElementById('todayRevenue').textContent = 
            new Intl.NumberFormat('vi-VN').format(revenue) + ' VND';
    }

    simulateSpaceChanges() {
        // Simulate some space status changes for demo
        const availableSpaces = this.spaces.filter(s => s.status === 'available');
        const occupiedSpaces = this.spaces.filter(s => s.status === 'occupied');

        if (Math.random() > 0.7 && availableSpaces.length > 0) {
            // Make a space occupied
            const space = availableSpaces[Math.floor(Math.random() * availableSpaces.length)];
            space.status = 'occupied';
            space.bookedUntil = (new Date().getHours() + 2) + ':00';
            this.renderSpaces();
        }

        if (Math.random() > 0.8 && occupiedSpaces.length > 0) {
            // Make a space available
            const space = occupiedSpaces[Math.floor(Math.random() * occupiedSpaces.length)];
            space.status = 'available';
            delete space.bookedUntil;
            this.renderSpaces();
        }
    }

    calculateTodayRevenue() {
        return this.bookings
            .filter(b => new Date(b.date).toDateString() === new Date().toDateString())
            .reduce((sum, b) => sum + (b.pricing?.finalPrice || 0), 0);
    }

    // Utility functions
    animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        counters.forEach(counter => {
            const target = parseInt(counter.textContent);
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            const animate = () => {
                current += step;
                if (current < target) {
                    counter.textContent = Math.floor(current) + (counter.textContent.includes('%') ? '%' : '+');
                    requestAnimationFrame(animate);
                } else {
                    counter.textContent = target + (counter.textContent.includes('%') ? '%' : '+');
                }
            };

            animate();
        });
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');
        
        notification.className = `notification ${type}`;
        notificationText.textContent = message;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    scrollToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    updateAnalytics() {
        this.updateRealTimeStats();
        // Additional analytics updates would go here
    }

    // Contact form submission
    submitContact(event) {
        event.preventDefault();
        this.showNotification('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.', 'success');
        event.target.reset();
    }
}

// AI Optimizer Class
class AIOptimizer {
    constructor() {
        this.demandPatterns = this.initializeDemandPatterns();
        this.pricingRules = this.initializePricingRules();
    }

    initializeDemandPatterns() {
        return {
            hourly: {
                8: 0.3, 9: 0.6, 10: 0.8, 11: 0.9, 12: 0.7,
                13: 0.5, 14: 0.8, 15: 0.9, 16: 0.8, 17: 0.6,
                18: 0.4, 19: 0.3, 20: 0.2, 21: 0.1, 22: 0.1
            },
            daily: {
                1: 0.6, 2: 0.8, 3: 0.9, 4: 0.8, 5: 0.7, 6: 0.4, 7: 0.3
            },
            seasonal: {
                1: 0.7, 2: 0.8, 3: 0.9, 4: 0.8, 5: 0.7, 6: 0.6,
                7: 0.5, 8: 0.6, 9: 0.8, 10: 0.9, 11: 0.8, 12: 0.7
            }
        };
    }

    initializePricingRules() {
        return {
            highDemand: 1.15, // +15% during high demand
            lowDemand: 0.9,   // -10% during low demand
            vipCustomer: 0.95, // -5% for VIP customers
            earlyBooking: 0.92, // -8% for bookings made 7+ days in advance
            lastMinute: 1.1,   // +10% for same-day bookings
            weekendDiscount: 0.85 // -15% weekend discount
        };
    }

    calculateOptimalPricing(bookingData) {
        const basePrice = this.getBasePriceForType(bookingData.spaceType);
        let multiplier = 1.0;

        // Apply demand-based pricing
        const demand = this.calculateDemand(bookingData.date, bookingData.timeSlot);
        if (demand > 0.8) {
            multiplier *= this.pricingRules.highDemand;
        } else if (demand < 0.4) {
            multiplier *= this.pricingRules.lowDemand;
        }

        // Apply time-based discounts
        const bookingDate = new Date(bookingData.date);
        const today = new Date();
        const daysInAdvance = Math.floor((bookingDate - today) / (1000 * 60 * 60 * 24));

        if (daysInAdvance >= 7) {
            multiplier *= this.pricingRules.earlyBooking;
        } else if (daysInAdvance === 0) {
            multiplier *= this.pricingRules.lastMinute;
        }

        // Weekend discount
        const dayOfWeek = bookingDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            multiplier *= this.pricingRules.weekendDiscount;
        }

        const finalPrice = Math.round(basePrice * multiplier);
        const discount = Math.round((1 - multiplier) * 100);

        return {
            basePrice,
            finalPrice,
            discount: discount > 0 ? discount : 0,
            multiplier
        };
    }

    calculateDiscount(bookingData) {
        const pricing = this.calculateOptimalPricing(bookingData);
        return pricing.discount;
    }

    calculateDemand(date, timeSlot) {
        const bookingDate = new Date(date);
        const dayOfWeek = bookingDate.getDay();
        const month = bookingDate.getMonth() + 1;

        let demand = this.demandPatterns.daily[dayOfWeek] || 0.5;
        demand *= this.demandPatterns.seasonal[month] || 0.5;

        // Time slot adjustments
        const timeMultipliers = {
            'morning': 0.8,
            'afternoon': 1.0,
            'evening': 0.6,
            'fullday': 0.9
        };

        demand *= timeMultipliers[timeSlot] || 0.7;

        return Math.min(demand, 1.0);
    }

    getBasePriceForType(spaceType) {
        const prices = {
            'desk': 50000,
            'meeting-room': 100000,
            'private-office': 200000,
            'lounge': 30000
        };
        return prices[spaceType] || 50000;
    }

    generateRecommendations() {
        // Simulate AI recommendations
        const spaces = [
            { id: 'A1', name: 'Bàn làm việc A1', type: 'desk', price: 45000 },
            { id: 'B1', name: 'Văn phòng riêng B1', type: 'private-office', price: 180000 }
        ];

        const bestSpace = spaces[Math.floor(Math.random() * spaces.length)];
        
        return {
            bestSpace,
            optimalTime: 'Chiều (13:00 - 17:00)',
            discountedPrice: bestSpace.price * 0.9,
            reason: 'Dựa trên lịch sử sử dụng và nhu cầu hiện tại, đây là lựa chọn tối ưu nhất cho bạn.'
        };
    }
}

// Global functions for HTML onclick handlers
function openBookingModal() {
    swspace.openBookingModal();
}

function closeBookingModal() {
    swspace.closeBookingModal();
}

function filterSpaces() {
    swspace.filterSpaces();
}

function changeView(viewType) {
    swspace.changeView(viewType);
}

function addNewSpace() {
    swspace.addNewSpace();
}

function updatePricing() {
    swspace.updatePricing();
}

function getAIRecommendation() {
    swspace.getAIRecommendation();
}

function scrollToSection(sectionId) {
    swspace.scrollToSection(sectionId);
}

function submitContact(event) {
    swspace.submitContact(event);
}

// Initialize the system when DOM is loaded
let swspace;

document.addEventListener('DOMContentLoaded', () => {
    swspace = new SWSpaceManager();
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('bookingModal');
        if (e.target === modal) {
            swspace.closeBookingModal();
        }
    });

    // Handle escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            swspace.closeBookingModal();
        }
    });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SWSpaceManager, AIOptimizer };
}