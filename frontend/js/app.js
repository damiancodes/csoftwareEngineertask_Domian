
if (typeof window.appLoaded === 'undefined') {
    window.appLoaded = true;
    
    let authToken = localStorage.getItem('authToken');
    let currentUser = null;
    
  
    try {
        const userString = localStorage.getItem('currentUser');
        if (userString) {
            currentUser = JSON.parse(userString);
            window.currentUser = currentUser; // Make globally available
        }
    } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('currentUser');
    }

    // Debug logging
    console.log('App.js loaded - Current path:', window.location.pathname);
    console.log('Auth token exists:', !!authToken);
    console.log('Current user exists:', !!currentUser);

    // API Base URL
    const API_BASE_URL = '/api';

    // Utility functions
    function showAlert(message, type = 'success') {
        // Remove existing alerts
        document.querySelectorAll('.alert.position-fixed').forEach(alert => alert.remove());
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    function setLoading(button, loading) {
        if (!button) return;
        
        const spinner = button.querySelector('.spinner-border');
        if (loading) {
            button.disabled = true;
            if (spinner) spinner.classList.remove('d-none');
        } else {
            button.disabled = false;
            if (spinner) spinner.classList.add('d-none');
        }
    }

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // API functions
    async function apiRequest(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            credentials: 'include',
            ...options
        };

        // Add CSRF token from cookie if present
        const xsrfToken = getCookie('XSRF-TOKEN');
        if (xsrfToken) {
            config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
        }

        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            console.log('Making API request to:', url);
            const response = await fetch(url, config);
            
            console.log('API response status:', response.status);
            
           
            if (response.status === 401 || response.status === 403) {
                console.log('Authentication failed, clearing auth data');
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
                authToken = null;
                currentUser = null;
                window.currentUser = null;
                
                // Only redirect if not already on login page
                if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/') {
                    window.location.href = '/';
                }
                throw new Error('Authentication failed');
            }
            
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }
            
            console.log('API response data:', data);

            if (!response.ok) {
                const message = typeof data === 'object' ? (data.message || `HTTP ${response.status}`) : data;
                throw new Error(message);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            
          
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error - please check your connection and ensure the server is running');
            }
            
            throw error;
        }
    }

    // Authentication functions
    async function login(email, password) {
        try {
            console.log('Attempting login for:', email);
            
            // Fetch CSRF cookie first
            try {
                await fetch('/sanctum/csrf-cookie', { credentials: 'include' });
            } catch (error) {
                console.warn('CSRF cookie fetch failed:', error);
            }

            const data = await apiRequest('/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            if (!data) {
                throw new Error('Login failed - no response from server');
            }

            console.log('Login successful:', data);
            
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            authToken = data.token;
            currentUser = data.user;
            window.currentUser = data.user;

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async function logout() {
        try {
            console.log('Attempting logout');
            await apiRequest('/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            authToken = null;
            currentUser = null;
            window.currentUser = null;
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            window.location.href = '/';
        }
    }

    function showLoginModal() {
        const modal = new bootstrap.Modal(document.getElementById('loginModal'));
        modal.show();
    }

    function scrollToFeatures() {
        const featuresElement = document.getElementById('features');
        if (featuresElement) {
            featuresElement.scrollIntoView({ behavior: 'smooth' });
        }
    }

    function redirectToDashboard() {
        console.log('Redirecting to dashboard');
        window.location.href = '/dashboard.html';
    }

    // Event listeners
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM Content Loaded - checking authentication...');
        
     
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('currentUser');
        
        if (token && user) {
            try {
                currentUser = JSON.parse(user);
                window.currentUser = currentUser;
                // Only redirect if we're on the main page
                if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
                    console.log('User authenticated, redirecting to dashboard in 500ms...');
                    setTimeout(() => {
                        redirectToDashboard();
                    }, 500);
                    return;
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
            }
        }

        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                const errorDiv = document.getElementById('loginError');
              
                if (errorDiv) {
                    errorDiv.classList.add('d-none');
                    errorDiv.textContent = '';
                }
                
                try {
                    setLoading(submitBtn, true);
                    await login(email, password);
                    
                    showAlert('Login successful! Redirecting to dashboard...', 'success');
                    setTimeout(redirectToDashboard, 1000);
                    
                } catch (error) {
                    console.error('Login error:', error);
                    if (errorDiv) {
                        errorDiv.textContent = error.message;
                        errorDiv.classList.remove('d-none');
                    }
                    showAlert('Login failed: ' + error.message, 'danger');
                } finally {
                    setLoading(submitBtn, false);
                }
            });
        }

        document.querySelectorAll('a[href="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
               
            });
        });

        document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.card, .stat-card').forEach(el => {
            observer.observe(el);
        });
    });

    window.TaskManager = {
        apiRequest,
        login,
        logout,
        showAlert,
        setLoading,
        authToken: () => localStorage.getItem('authToken'),
        getCurrentUser: () => currentUser
    };

    window.showLoginModal = showLoginModal;
    window.scrollToFeatures = scrollToFeatures;
}