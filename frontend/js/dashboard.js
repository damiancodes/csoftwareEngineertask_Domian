
if (typeof window.dashboardLoaded === 'undefined') {
    window.dashboardLoaded = true;
    
    let tasks = [];
    let users = [];
    
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Dashboard DOMContentLoaded');
        initializeDashboard();
    });

    function initializeDashboard() {
        console.log('Initializing dashboard...');
        
        // Check authentication
        const token = localStorage.getItem('authToken');
        const userString = localStorage.getItem('currentUser');
        
        if (!token || !userString) {
            console.log('No auth token or user, redirecting to login');
            window.location.href = '/';
            return;
        }
        
        try {
            // Parse and set current user
            window.currentUser = JSON.parse(userString);
            console.log('Current user:', window.currentUser);
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            window.location.href = '/';
            return;
        }

        // Set user info in UI
        updateUserInfo();
        
        // Show/hide admin elements
        toggleAdminElements();
        
        // Set up event listeners
        setupEventListeners();
        
        // Load initial data
        loadDashboardData();
    }

    function updateUserInfo() {
        const userNameEl = document.getElementById('userName');
        const userRoleEl = document.getElementById('userRole');
        
        if (userNameEl && window.currentUser) {
            userNameEl.textContent = window.currentUser.name;
        }
        if (userRoleEl && window.currentUser) {
            userRoleEl.textContent = window.currentUser.role.charAt(0).toUpperCase() + window.currentUser.role.slice(1);
        }
    }


    function toggleAdminElements() {
        if (window.currentUser && window.currentUser.role === 'admin') {
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.display = 'block';
            });
        }
    }

    // Setup all event listeners
    function setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Navigation links
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const onclick = this.getAttribute('onclick');
                if (onclick) {
                    const match = onclick.match(/showSection\('(.+?)'\)/);
                    if (match) {
                        showSection(match[1]);
                    }
                }
            });
        });

        // Create task form
        const createTaskForm = document.getElementById('createTaskForm');
        if (createTaskForm) {
            createTaskForm.addEventListener('submit', handleCreateTask);
        }

        // Create user form
        const createUserForm = document.getElementById('createUserForm');
        if (createUserForm) {
            createUserForm.addEventListener('submit', handleCreateUser);
        }
    }

    // Load initial dashboard data
    async function loadDashboardData() {
        console.log('Loading dashboard data...');
        await loadTasks();
        
        if (window.currentUser && window.currentUser.role === 'admin') {
            await loadUsers();
        }
        
        updateDashboardStats();
    }

    // Load tasks from API
    async function loadTasks() {
        console.log('Loading tasks...');
        
        try {
           
            const mockTasks = [
                {
                    id: 1,
                    title: "Sample Task",
                    description: "This is a sample task description",
                    status: "pending",
                    deadline: "2025-07-20",
                    assigned_user: { name: "Domian" }
                },
                {
                    id: 2,
                    title: "Another Task",
                    description: "Another task description",
                    status: "in_progress",
                    deadline: "2025-07-25",
                    assigned_user: { name: "Damian Dev" }
                }
            ];
            
            // Try API request first
            if (window.TaskManager) {
                try {
                    const response = await window.TaskManager.apiRequest('/tasks');
                    if (response && Array.isArray(response)) {
                        tasks = response;
                        console.log('Loaded tasks from API:', tasks);
                    } else {
                        console.log('API returned no data, using mock data');
                        tasks = mockTasks;
                    }
                } catch (error) {
                    console.log('API request failed, using mock data:', error.message);
                    tasks = mockTasks;
                }
            } else {
                console.log('TaskManager not available, using mock data');
                tasks = mockTasks;
            }
            
            renderTasksTable();
            
        } catch (error) {
            console.error('Error loading tasks:', error);
            tasks = [];
        }
    }

    // Load users from API (admin only)
    async function loadUsers() {
        if (!window.currentUser || window.currentUser.role !== 'admin') return;
        
        console.log('Loading users...');
        
        try {
            // Mock users data
            const mockUsers = [
                {
                    id: 1,
                    name: "John Doe",
                    email: "john@example.com",
                    role: "user"
                },
                {
                    id: 2,
                    name: "Jane Smith",
                    email: "jane@example.com",
                    role: "admin"
                }
            ];
            
            // Try API request first
            if (window.TaskManager) {
                try {
                    const response = await window.TaskManager.apiRequest('/users');
                    if (response && Array.isArray(response)) {
                        users = response;
                        console.log('Loaded users from API:', users);
                    } else {
                        console.log('API returned no data, using mock data');
                        users = mockUsers;
                    }
                } catch (error) {
                    console.log('API request failed, using mock data:', error.message);
                    users = mockUsers;
                }
            } else {
                console.log('TaskManager not available, using mock data');
                users = mockUsers;
            }
            
            renderUsersTable();
            populateUserSelect();
            
        } catch (error) {
            console.error('Error loading users:', error);
            users = [];
        }
    }

    
    function updateDashboardStats() {
        const stats = {
            total: tasks.length,
            pending: tasks.filter(t => t.status === 'pending').length,
            inProgress: tasks.filter(t => t.status === 'in_progress').length,
            completed: tasks.filter(t => t.status === 'completed').length
        };

     
        const totalTasksEl = document.getElementById('totalTasks');
        const pendingTasksEl = document.getElementById('pendingTasks');
        const inProgressTasksEl = document.getElementById('inProgressTasks');
        const completedTasksEl = document.getElementById('completedTasks');
        
        if (totalTasksEl) totalTasksEl.textContent = stats.total;
        if (pendingTasksEl) pendingTasksEl.textContent = stats.pending;
        if (inProgressTasksEl) inProgressTasksEl.textContent = stats.inProgress;
        if (completedTasksEl) completedTasksEl.textContent = stats.completed;

        // Update recent tasks
        loadRecentTasks();
    }

    // Load recent tasks for dashboard
    function loadRecentTasks() {
        const recentTasks = tasks.slice(0, 5);
        const container = document.getElementById('recentTasksList');
        
        if (!container) return;

        if (recentTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state text-center py-4">
                    <i class="bi bi-list-task fs-1 text-muted"></i>
                    <h5 class="mt-2">No tasks yet</h5>
                    <p class="text-muted">Create your first task to get started</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recentTasks.map(task => `
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                <div>
                    <h6 class="mb-1">${task.title}</h6>
                    <small class="text-muted">${task.description.substring(0, 50)}${task.description.length > 50 ? '...' : ''}</small>
                </div>
                <div class="text-end">
                    <span class="badge ${getStatusBadgeClass(task.status)}">${formatStatus(task.status)}</span>
                    <br>
                    <small class="text-muted">Due: ${formatDate(task.deadline)}</small>
                </div>
            </div>
        `).join('');
    }

    // Render tasks table
    function renderTasksTable() {
        const tbody = document.getElementById('tasksTableBody');
        
        if (!tbody) return;
        
        if (tasks.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4">
                        <div class="empty-state">
                            <i class="bi bi-list-task fs-1 text-muted"></i>
                            <h5 class="mt-2">No tasks found</h5>
                            <p class="text-muted">Create your first task to get started</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = tasks.map(task => `
            <tr class="${isOverdue(task) ? 'table-danger' : ''}">
                <td>
                    <strong>${task.title}</strong>
                    <br>
                    <small class="text-muted">${task.description.substring(0, 50)}${task.description.length > 50 ? '...' : ''}</small>
                </td>
                <td>${task.assigned_user ? task.assigned_user.name : 'Unassigned'}</td>
                <td>
                    <span class="badge ${getStatusBadgeClass(task.status)}">${formatStatus(task.status)}</span>
                </td>
                <td>
                    <span class="${isOverdue(task) ? 'text-danger' : ''}">${formatDate(task.deadline)}</span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="editTask(${task.id})">
                            <i class="bi bi-pencil"></i>
                        </button>
                        ${window.currentUser && window.currentUser.role === 'admin' ? `
                            <button class="btn btn-outline-danger" onclick="deleteTask(${task.id})">
                                <i class="bi bi-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Render users table
    function renderUsersTable() {
        const tbody = document.getElementById('usersTableBody');
        
        if (!tbody) return;
        
        if (users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-4">
                        <div class="empty-state">
                            <i class="bi bi-people fs-1 text-muted"></i>
                            <h5 class="mt-2">No users found</h5>
                            <p class="text-muted">Create your first user to get started</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>
                    <span class="badge ${user.role === 'admin' ? 'bg-danger' : 'bg-secondary'}">${user.role}</span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="editUser(${user.id})">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteUser(${user.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Populate user select dropdown
    function populateUserSelect() {
        const select = document.getElementById('taskAssignee');
        if (!select) return;

        select.innerHTML = '<option value="">Select User</option>';
        users.forEach(user => {
            select.innerHTML += `<option value="${user.id}">${user.name} (${user.email})</option>`;
        });
    }


    function showSection(section) {
        console.log('Showing section:', section);
        
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(el => {
            el.style.display = 'none';
        });

        // Show selected section
        const sectionEl = document.getElementById(`${section}-section`);
        if (sectionEl) {
            sectionEl.style.display = 'block';
        }

        // Update navigation
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(el => {
            el.classList.remove('active');
        });
        
       
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(el => {
            const onclick = el.getAttribute('onclick');
            if (onclick && onclick.includes(`'${section}'`)) {
                el.classList.add('active');
            }
        });

      
        const titles = {
            'dashboard': 'Dashboard',
            'tasks': 'Tasks',
            'users': 'Users',
            'profile': 'Profile'
        };
        const pageTitleEl = document.getElementById('pageTitle');
        if (pageTitleEl) {
            pageTitleEl.textContent = titles[section] || 'Dashboard';
        }

        switch(section) {
            case 'dashboard':
                updateDashboardStats();
                break;
            case 'tasks':
                renderTasksTable();
                break;
            case 'users':
                if (window.currentUser && window.currentUser.role === 'admin') {
                    renderUsersTable();
                }
                break;
            case 'profile':
                loadProfile();
                break;
        }
    }

    // Load profile data
    function loadProfile() {
        if (!window.currentUser) return;
        
        const profileNameEl = document.getElementById('profileName');
        const profileEmailEl = document.getElementById('profileEmail');
        const profileRoleEl = document.getElementById('profileRole');
        const profileCreatedEl = document.getElementById('profileCreated');
        
        if (profileNameEl) profileNameEl.value = window.currentUser.name;
        if (profileEmailEl) profileEmailEl.value = window.currentUser.email;
        if (profileRoleEl) profileRoleEl.value = window.currentUser.role;
        if (profileCreatedEl) profileCreatedEl.value = formatDate(window.currentUser.created_at);
    }

    // Handle create task form submission
    async function handleCreateTask(e) {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            assigned_to: document.getElementById('taskAssignee').value,
            deadline: document.getElementById('taskDeadline').value
        };

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const errorDiv = document.getElementById('createTaskError');

        try {
            if (window.TaskManager) {
                window.TaskManager.setLoading(submitBtn, true);
            }
            if (errorDiv) errorDiv.classList.add('d-none');

          
            console.log('Creating task with data:', formData);
            
            // Add to local tasks array for demo
            const newTask = {
                id: tasks.length + 1,
                ...formData,
                status: 'pending',
                assigned_user: users.find(u => u.id == formData.assigned_to)
            };
            tasks.push(newTask);

            if (window.TaskManager) {
                window.TaskManager.showAlert('Task created successfully!', 'success');
            }
            
            // Close modal and reset form
            const modal = bootstrap.Modal.getInstance(document.getElementById('createTaskModal'));
            if (modal) modal.hide();
            e.target.reset();
            
            // Reload data
            renderTasksTable();
            updateDashboardStats();

        } catch (error) {
            console.error('Error creating task:', error);
            if (errorDiv) {
                errorDiv.textContent = error.message;
                errorDiv.classList.remove('d-none');
            }
        } finally {
            if (window.TaskManager) {
                window.TaskManager.setLoading(submitBtn, false);
            }
        }
    }

    async function handleCreateUser(e) {
        e.preventDefault();
        
        const password = document.getElementById('userPassword').value;
        const passwordConfirm = document.getElementById('userPasswordConfirm').value;
        
        if (password !== passwordConfirm) {
            const errorDiv = document.getElementById('createUserError');
            if (errorDiv) {
                errorDiv.textContent = 'Passwords do not match';
                errorDiv.classList.remove('d-none');
            }
            return;
        }

        const formData = {
            name: document.getElementById('userName').value,
            email: document.getElementById('userEmail').value,
            password: password,
            password_confirmation: passwordConfirm,
            role: document.getElementById('userRole').value
        };

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const errorDiv = document.getElementById('createUserError');

        try {
            if (window.TaskManager) {
                window.TaskManager.setLoading(submitBtn, true);
            }
            if (errorDiv) errorDiv.classList.add('d-none');

           
            console.log('Creating user with data:', formData);
            
         
            const newUser = {
                id: users.length + 1,
                name: formData.name,
                email: formData.email,
                role: formData.role
            };
            users.push(newUser);

            if (window.TaskManager) {
                window.TaskManager.showAlert('User created successfully!', 'success');
            }
            
          
            const modal = bootstrap.Modal.getInstance(document.getElementById('createUserModal'));
            if (modal) modal.hide();
            e.target.reset();
            
            // Reload data
            renderUsersTable();
            populateUserSelect();

        } catch (error) {
            console.error('Error creating user:', error);
            if (errorDiv) {
                errorDiv.textContent = error.message;
                errorDiv.classList.remove('d-none');
            }
        } finally {
            if (window.TaskManager) {
                window.TaskManager.setLoading(submitBtn, false);
            }
        }
    }

  
    function formatStatus(status) {
        return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    function getStatusBadgeClass(status) {
        const classes = {
            'pending': 'bg-warning',
            'in_progress': 'bg-info',
            'completed': 'bg-success'
        };
        return classes[status] || 'bg-secondary';
    }

    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    }

    function isOverdue(task) {
        return new Date(task.deadline) < new Date() && task.status !== 'completed';
    }

   
    window.showSection = showSection;
    window.toggleSidebar = function() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('show');
        }
    };

    window.showCreateTaskModal = function() {
        if (!window.currentUser || window.currentUser.role !== 'admin') {
            if (window.TaskManager) {
                window.TaskManager.showAlert('Only administrators can create tasks', 'warning');
            }
            return;
        }
        
        const modal = new bootstrap.Modal(document.getElementById('createTaskModal'));
        modal.show();
    };

    window.showCreateUserModal = function() {
        const modal = new bootstrap.Modal(document.getElementById('createUserModal'));
        modal.show();
    };

    window.editTask = function(taskId) {
        if (window.TaskManager) {
            window.TaskManager.showAlert('Edit functionality coming soon!', 'info');
        }
    };

    window.deleteTask = async function(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) return;

        try {
           
            tasks = tasks.filter(t => t.id !== taskId);
            
            if (window.TaskManager) {
                window.TaskManager.showAlert('Task deleted successfully!', 'success');
            }
            
            renderTasksTable();
            updateDashboardStats();
        } catch (error) {
            console.error('Error deleting task:', error);
            if (window.TaskManager) {
                window.TaskManager.showAlert('Error deleting task: ' + error.message, 'danger');
            }
        }
    };

    window.editUser = function(userId) {
        if (window.TaskManager) {
            window.TaskManager.showAlert('Edit functionality coming soon!', 'info');
        }
    };

    window.deleteUser = async function(userId) {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
        
            users = users.filter(u => u.id !== userId);
            
            if (window.TaskManager) {
                window.TaskManager.showAlert('User deleted successfully!', 'success');
            }
            
            renderUsersTable();
            populateUserSelect();
        } catch (error) {
            console.error('Error deleting user:', error);
            if (window.TaskManager) {
                window.TaskManager.showAlert('Error deleting user: ' + error.message, 'danger');
            }
        }
    };

    window.logout = async function() {
        try {
            if (window.TaskManager) {
                await window.TaskManager.logout();
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Force logout anyway
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            window.location.href = '/';
        }
    };
}