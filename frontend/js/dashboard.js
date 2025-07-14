
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
                <td colspan="6" class="text-center py-4">
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
                <input type="checkbox" name="taskCheckbox" value="${task.id}" class="form-check-input">
            </td>
            <td>
                <strong>${task.title}</strong>
                <br>
                <small class="text-muted">${task.description.substring(0, 50)}${task.description.length > 50 ? '...' : ''}</small>
            </td>
            <td>${task.assigned_user ? task.assigned_user.name : 'Unassigned'}</td>
            <td>
                <div class="dropdown">
                    <span class="badge ${getStatusBadgeClass(task.status)} dropdown-toggle" data-bs-toggle="dropdown" style="cursor: pointer;">
                        ${formatStatus(task.status)}
                    </span>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#" onclick="updateTaskStatus(${task.id}, 'pending')">
                            <i class="bi bi-clock text-warning me-2"></i>Pending
                        </a></li>
                        <li><a class="dropdown-item" href="#" onclick="updateTaskStatus(${task.id}, 'in_progress')">
                            <i class="bi bi-arrow-repeat text-info me-2"></i>In Progress
                        </a></li>
                        <li><a class="dropdown-item" href="#" onclick="updateTaskStatus(${task.id}, 'completed')">
                            <i class="bi bi-check-circle text-success me-2"></i>Completed
                        </a></li>
                    </ul>
                </div>
            </td>
            <td>
                <span class="${isOverdue(task) ? 'text-danger' : ''}">${formatDate(task.deadline)}</span>
                ${isOverdue(task) ? '<br><small class="text-danger"><i class="bi bi-exclamation-triangle"></i> Overdue</small>' : ''}
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-info" onclick="viewTaskDetails(${task.id})" title="View Details">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-outline-primary" onclick="editTask(${task.id})" title="Edit Task">
                        <i class="bi bi-pencil"></i>
                    </button>
                    ${window.currentUser && window.currentUser.role === 'admin' ? `
                        <button class="btn btn-outline-danger" onclick="deleteTask(${task.id})" title="Delete Task">
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

    // ==================== ENHANCED CRUD FUNCTIONALITY ====================

    // Global variables for edit operations
    let currentEditingTask = null;
    let currentEditingUser = null;

    // ==================== TASK CRUD OPERATIONS ====================

    // Edit Task Function
    window.editTask = async function(taskId) {
        console.log('Editing task with ID:', taskId);
        const task = tasks.find(t => t.id === taskId);
        if (!task) {
            if (window.TaskManager) window.TaskManager.showAlert('Task not found!', 'danger');
            return;
        }
        currentEditingTask = task;
        document.getElementById('editTaskTitle').value = task.title;
        document.getElementById('editTaskDescription').value = task.description;
        document.getElementById('editTaskStatus').value = task.status;
        document.getElementById('editTaskAssignee').value = task.assigned_user ? task.assigned_user.id : '';
        document.getElementById('editTaskDeadline').value = task.deadline;
        const modal = new bootstrap.Modal(document.getElementById('editTaskModal'));
        modal.show();
    };

    // Handle Edit Task Form Submission
    async function handleEditTask(e) {
        e.preventDefault();
        if (!currentEditingTask) {
            console.error('No task being edited');
            return;
        }
        const formData = {
            title: document.getElementById('editTaskTitle').value,
            description: document.getElementById('editTaskDescription').value,
            status: document.getElementById('editTaskStatus').value,
            assigned_to: document.getElementById('editTaskAssignee').value,
            deadline: document.getElementById('editTaskDeadline').value
        };
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const errorDiv = document.getElementById('editTaskError');
        try {
            if (window.TaskManager) window.TaskManager.setLoading(submitBtn, true);
            if (errorDiv) errorDiv.classList.add('d-none');
            let success = false;
            if (window.TaskManager) {
                try {
                    await window.TaskManager.apiRequest(`/tasks/${currentEditingTask.id}`, {
                        method: 'PUT',
                        body: JSON.stringify(formData)
                    });
                    success = true;
                    console.log('Task updated via API');
                } catch (error) {
                    console.log('API update failed, updating locally:', error.message);
                }
            }
            const taskIndex = tasks.findIndex(t => t.id === currentEditingTask.id);
            if (taskIndex !== -1) {
                tasks[taskIndex] = {
                    ...tasks[taskIndex],
                    ...formData,
                    assigned_user: users.find(u => u.id == formData.assigned_to) || null
                };
            }
            if (window.TaskManager) window.TaskManager.showAlert('Task updated successfully!', 'success');
            const modal = bootstrap.Modal.getInstance(document.getElementById('editTaskModal'));
            if (modal) modal.hide();
            currentEditingTask = null;
            renderTasksTable();
            updateDashboardStats();
        } catch (error) {
            console.error('Error updating task:', error);
            if (errorDiv) {
                errorDiv.textContent = error.message;
                errorDiv.classList.remove('d-none');
            }
        } finally {
            if (window.TaskManager) window.TaskManager.setLoading(submitBtn, false);
        }
    }

    // Delete Task Function
    window.deleteTask = async function(taskId) {
        if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
            return;
        }
        try {
            let success = false;
            if (window.TaskManager) {
                try {
                    await window.TaskManager.apiRequest(`/tasks/${taskId}`, {
                        method: 'DELETE'
                    });
                    success = true;
                    console.log('Task deleted via API');
                } catch (error) {
                    console.log('API delete failed, deleting locally:', error.message);
                }
            }
            tasks = tasks.filter(t => t.id !== taskId);
            if (window.TaskManager) window.TaskManager.showAlert('Task deleted successfully!', 'success');
            renderTasksTable();
            updateDashboardStats();
        } catch (error) {
            console.error('Error deleting task:', error);
            if (window.TaskManager) window.TaskManager.showAlert('Error deleting task: ' + error.message, 'danger');
        }
    };

    // ==================== USER CRUD OPERATIONS ====================

    // Edit User Function
    window.editUser = async function(userId) {
        console.log('Editing user with ID:', userId);
        const user = users.find(u => u.id === userId);
        if (!user) {
            if (window.TaskManager) window.TaskManager.showAlert('User not found!', 'danger');
            return;
        }
        currentEditingUser = user;
        document.getElementById('editUserName').value = user.name;
        document.getElementById('editUserEmail').value = user.email;
        document.getElementById('editUserRole').value = user.role;
        const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
        modal.show();
    };

    // Handle Edit User Form Submission
    async function handleEditUser(e) {
        e.preventDefault();
        if (!currentEditingUser) {
            console.error('No user being edited');
            return;
        }
        const formData = {
            name: document.getElementById('editUserName').value,
            email: document.getElementById('editUserEmail').value,
            role: document.getElementById('editUserRole').value
        };
        const password = document.getElementById('editUserPassword').value;
        // If you want password confirmation, add a field and check here
        if (password) {
            formData.password = password;
        }
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const errorDiv = document.getElementById('editUserError');
        try {
            if (window.TaskManager) window.TaskManager.setLoading(submitBtn, true);
            if (errorDiv) errorDiv.classList.add('d-none');
            let success = false;
            if (window.TaskManager) {
                try {
                    await window.TaskManager.apiRequest(`/users/${currentEditingUser.id}`, {
                        method: 'PUT',
                        body: JSON.stringify(formData)
                    });
                    success = true;
                    console.log('User updated via API');
                } catch (error) {
                    console.log('API update failed, updating locally:', error.message);
                }
            }
            const userIndex = users.findIndex(u => u.id === currentEditingUser.id);
            if (userIndex !== -1) {
                users[userIndex] = {
                    ...users[userIndex],
                    name: formData.name,
                    email: formData.email,
                    role: formData.role
                };
            }
            if (window.TaskManager) window.TaskManager.showAlert('User updated successfully!', 'success');
            const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
            if (modal) modal.hide();
            e.target.reset();
            currentEditingUser = null;
            renderUsersTable();
            populateUserSelect();
        } catch (error) {
            console.error('Error updating user:', error);
            if (errorDiv) {
                errorDiv.textContent = error.message;
                errorDiv.classList.remove('d-none');
            }
        } finally {
            if (window.TaskManager) window.TaskManager.setLoading(submitBtn, false);
        }
    }

    // Delete User Function
    window.deleteUser = async function(userId) {
        const user = users.find(u => u.id === userId);
        if (!user) {
            if (window.TaskManager) window.TaskManager.showAlert('User not found!', 'danger');
            return;
        }
        if (window.currentUser && window.currentUser.id === userId) {
            if (window.TaskManager) window.TaskManager.showAlert('You cannot delete your own account!', 'warning');
            return;
        }
        if (!confirm(`Are you sure you want to delete user "${user.name}"? This action cannot be undone.`)) {
            return;
        }
        try {
            let success = false;
            if (window.TaskManager) {
                try {
                    await window.TaskManager.apiRequest(`/users/${userId}`, {
                        method: 'DELETE'
                    });
                    success = true;
                    console.log('User deleted via API');
                } catch (error) {
                    console.log('API delete failed, deleting locally:', error.message);
                }
            }
            users = users.filter(u => u.id !== userId);
            if (window.TaskManager) window.TaskManager.showAlert('User deleted successfully!', 'success');
            renderUsersTable();
            populateUserSelect();
        } catch (error) {
            console.error('Error deleting user:', error);
            if (window.TaskManager) window.TaskManager.showAlert('Error deleting user: ' + error.message, 'danger');
        }
    };

    // ==================== ENHANCED TASK STATUS UPDATE ====================

    window.updateTaskStatus = async function(taskId, newStatus) {
        try {
            if (window.TaskManager) {
                try {
                    await window.TaskManager.apiRequest(`/tasks/${taskId}/status`, {
                        method: 'PATCH',
                        body: JSON.stringify({ status: newStatus })
                    });
                    console.log('Task status updated via API');
                } catch (error) {
                    console.log('API status update failed, updating locally:', error.message);
                }
            }
            const taskIndex = tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                tasks[taskIndex].status = newStatus;
            }
            if (window.TaskManager) window.TaskManager.showAlert('Task status updated successfully!', 'success');
            renderTasksTable();
            updateDashboardStats();
        } catch (error) {
            console.error('Error updating task status:', error);
            if (window.TaskManager) window.TaskManager.showAlert('Error updating task status: ' + error.message, 'danger');
        }
    };

    // ==================== INITIALIZATION ====================

    function setupCRUDEventListeners() {
        const editTaskForm = document.getElementById('editTaskForm');
        if (editTaskForm) {
            editTaskForm.addEventListener('submit', handleEditTask);
        }
        const editUserForm = document.getElementById('editUserForm');
        if (editUserForm) {
            editUserForm.addEventListener('submit', handleEditUser);
        }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupCRUDEventListeners);
    } else {
        setupCRUDEventListeners();
    }

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

    // ==================== ENHANCED CRUD FUNCTIONALITY ====================

    // Search and Filter Functions
    window.searchTasks = function(query) {
        if (!query.trim()) {
            renderTasksTable();
            return;
        }
        
        const filteredTasks = tasks.filter(task => 
            task.title.toLowerCase().includes(query.toLowerCase()) ||
            task.description.toLowerCase().includes(query.toLowerCase()) ||
            (task.assigned_user && task.assigned_user.name.toLowerCase().includes(query.toLowerCase()))
        );
        
        // Temporarily replace tasks for rendering
        const originalTasks = [...tasks];
        tasks = filteredTasks;
        renderTasksTable();
        tasks = originalTasks;
    };

    window.searchUsers = function(query) {
        if (!query.trim()) {
            renderUsersTable();
            return;
        }
        
        const filteredUsers = users.filter(user => 
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase())
        );
        
        // Temporarily replace users for rendering
        const originalUsers = [...users];
        users = filteredUsers;
        renderUsersTable();
        users = originalUsers;
    };

    window.filterTasksByStatus = function(status) {
        if (status === 'all') {
            renderTasksTable();
            return;
        }
        
        const filteredTasks = tasks.filter(task => task.status === status);
        
        // Temporarily replace tasks for rendering
        const originalTasks = [...tasks];
        tasks = filteredTasks;
        renderTasksTable();
        tasks = originalTasks;
    };

    // Export Functions
    window.exportTasks = function() {
        const csvContent = [
            ['Title', 'Description', 'Status', 'Assigned To', 'Deadline', 'Created'],
            ...tasks.map(task => [
                task.title,
                task.description,
                task.status,
                task.assigned_user ? task.assigned_user.name : 'Unassigned',
                task.deadline,
                task.created_at || 'N/A'
            ])
        ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tasks_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        if (window.TaskManager) {
            window.TaskManager.showAlert('Tasks exported successfully!', 'success');
        }
    };

    window.exportUsers = function() {
        const csvContent = [
            ['Name', 'Email', 'Role', 'Created'],
            ...users.map(user => [
                user.name,
                user.email,
                user.role,
                user.created_at || 'N/A'
            ])
        ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        if (window.TaskManager) {
            window.TaskManager.showAlert('Users exported successfully!', 'success');
        }
    };

    // Refresh Functions
    window.refreshTasks = async function() {
        console.log('Refreshing tasks...');
        await loadTasks();
        if (window.TaskManager) {
            window.TaskManager.showAlert('Tasks refreshed!', 'info');
        }
    };

    window.refreshUsers = async function() {
        console.log('Refreshing users...');
        await loadUsers();
        if (window.TaskManager) {
            window.TaskManager.showAlert('Users refreshed!', 'info');
        }
    };

    // Filter users by role
    window.filterUsersByRole = function(role) {
        if (role === 'all') {
            renderUsersTable();
            return;
        }
        
        const filteredUsers = users.filter(user => user.role === role);
        
        // Temporarily replace users for rendering
        const originalUsers = [...users];
        users = filteredUsers;
        renderUsersTable();
        users = originalUsers;
    };

    // Task Details Modal
    window.viewTaskDetails = function(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) {
            if (window.TaskManager) window.TaskManager.showAlert('Task not found!', 'danger');
            return;
        }
        
        // Populate modal with task details
        document.getElementById('taskDetailTitle').textContent = task.title;
        document.getElementById('taskDetailDescription').textContent = task.description;
        document.getElementById('taskDetailStatus').innerHTML = `<span class="badge ${getStatusBadgeClass(task.status)}">${formatStatus(task.status)}</span>`;
        document.getElementById('taskDetailAssignee').textContent = task.assigned_user ? task.assigned_user.name : 'Unassigned';
        document.getElementById('taskDetailDeadline').textContent = formatDate(task.deadline);
        document.getElementById('taskDetailCreated').textContent = task.created_at ? formatDate(task.created_at) : 'N/A';
        
        // Show overdue warning if applicable
        const overdueDiv = document.getElementById('taskDetailOverdue');
        if (isOverdue(task)) {
            overdueDiv.classList.remove('d-none');
        } else {
            overdueDiv.classList.add('d-none');
        }
        
        // Store current task ID for edit function
        window.currentViewingTaskId = taskId;
        
        const modal = new bootstrap.Modal(document.getElementById('taskDetailsModal'));
        modal.show();
    };

    // Edit task from details modal
    window.editTaskFromDetails = function() {
        // Close details modal first
        const detailsModal = bootstrap.Modal.getInstance(document.getElementById('taskDetailsModal'));
        if (detailsModal) detailsModal.hide();
        
        // Use stored task ID
        if (window.currentViewingTaskId) {
            editTask(window.currentViewingTaskId);
        }
    };

    // Bulk operations
    window.bulkDeleteTasks = function() {
        const checkboxes = document.querySelectorAll('input[name="taskCheckbox"]:checked');
        if (checkboxes.length === 0) {
            if (window.TaskManager) {
                window.TaskManager.showAlert('Please select tasks to delete', 'warning');
            }
            return;
        }
        
        if (!confirm(`Are you sure you want to delete ${checkboxes.length} task(s)?`)) {
            return;
        }
        
        const taskIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
        
        // Remove tasks from array
        tasks = tasks.filter(task => !taskIds.includes(task.id));
        
        renderTasksTable();
        updateDashboardStats();
        
        if (window.TaskManager) {
            window.TaskManager.showAlert(`${taskIds.length} task(s) deleted successfully!`, 'success');
        }
    };

    window.bulkUpdateTaskStatus = function() {
        const checkboxes = document.querySelectorAll('input[name="taskCheckbox"]:checked');
        if (checkboxes.length === 0) {
            if (window.TaskManager) {
                window.TaskManager.showAlert('Please select tasks to update', 'warning');
            }
            return;
        }
        
        const newStatus = prompt('Enter new status (pending, in_progress, completed):');
        if (!newStatus || !['pending', 'in_progress', 'completed'].includes(newStatus)) {
            return;
        }
        
        const taskIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
        
        // Update tasks status
        tasks.forEach(task => {
            if (taskIds.includes(task.id)) {
                task.status = newStatus;
            }
        });
        
        renderTasksTable();
        updateDashboardStats();
        
        if (window.TaskManager) {
            window.TaskManager.showAlert(`${taskIds.length} task(s) status updated to ${formatStatus(newStatus)}!`, 'success');
        }
    };

    // Advanced task filtering
    window.filterTasksByDateRange = function() {
        const startDate = document.getElementById('startDateFilter').value;
        const endDate = document.getElementById('endDateFilter').value;
        
        if (!startDate || !endDate) {
            renderTasksTable();
            return;
        }
        
        const filteredTasks = tasks.filter(task => {
            const taskDate = new Date(task.deadline);
            return taskDate >= new Date(startDate) && taskDate <= new Date(endDate);
        });
        
        // Temporarily replace tasks for rendering
        const originalTasks = [...tasks];
        tasks = filteredTasks;
        renderTasksTable();
        tasks = originalTasks;
    };

    // Clear date filter
    window.clearDateFilter = function() {
        document.getElementById('startDateFilter').value = '';
        document.getElementById('endDateFilter').value = '';
        renderTasksTable();
        
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('dateFilterModal'));
        if (modal) modal.hide();
    };

    // Show task statistics modal
    window.showTaskStatistics = function() {
        const stats = getTaskStatistics();
        
        document.getElementById('statTotal').textContent = stats.total;
        document.getElementById('statPending').textContent = stats.pending;
        document.getElementById('statInProgress').textContent = stats.inProgress;
        document.getElementById('statCompleted').textContent = stats.completed;
        document.getElementById('statOverdue').textContent = stats.overdue;
        
        const progressBar = document.getElementById('completionProgress');
        progressBar.style.width = stats.completionRate;
        progressBar.textContent = stats.completionRate;
        
        const modal = new bootstrap.Modal(document.getElementById('statisticsModal'));
        modal.show();
    };

    // Show user statistics
    window.showUserStatistics = function() {
        const totalUsers = users.length;
        const adminUsers = users.filter(u => u.role === 'admin').length;
        const regularUsers = users.filter(u => u.role === 'user').length;
        
        const stats = {
            total: totalUsers,
            admins: adminUsers,
            users: regularUsers,
            adminPercentage: totalUsers > 0 ? ((adminUsers / totalUsers) * 100).toFixed(1) : 0
        };
        
        // You can create a similar modal for user statistics or use alerts
        if (window.TaskManager) {
            window.TaskManager.showAlert(
                `User Statistics:\n` +
                `Total Users: ${stats.total}\n` +
                `Admins: ${stats.admins}\n` +
                `Regular Users: ${stats.users}\n` +
                `Admin Percentage: ${stats.adminPercentage}%`,
                'info'
            );
        }
    };

    // Task statistics
    window.getTaskStatistics = function() {
        const stats = {
            total: tasks.length,
            pending: tasks.filter(t => t.status === 'pending').length,
            inProgress: tasks.filter(t => t.status === 'in_progress').length,
            completed: tasks.filter(t => t.status === 'completed').length,
            overdue: tasks.filter(t => isOverdue(t)).length
        };
        
        const completionRate = stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0;
        
        return {
            ...stats,
            completionRate: completionRate + '%'
        };
    };

    // Enhanced task table with checkboxes for bulk operations
    function renderTasksTableWithBulkActions() {
        const tbody = document.getElementById('tasksTableBody');
        
        if (!tbody) return;
        
        if (tasks.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
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
                    <input type="checkbox" name="taskCheckbox" value="${task.id}" class="form-check-input">
                </td>
                <td>
                    <strong>${task.title}</strong>
                    <br>
                    <small class="text-muted">${task.description.substring(0, 50)}${task.description.length > 50 ? '...' : ''}</small>
                </td>
                <td>${task.assigned_user ? task.assigned_user.name : 'Unassigned'}</td>
                <td>
                    <div class="dropdown">
                        <span class="badge ${getStatusBadgeClass(task.status)} dropdown-toggle" data-bs-toggle="dropdown" style="cursor: pointer;">
                            ${formatStatus(task.status)}
                        </span>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#" onclick="updateTaskStatus(${task.id}, 'pending')">
                                <i class="bi bi-clock text-warning me-2"></i>Pending
                            </a></li>
                            <li><a class="dropdown-item" href="#" onclick="updateTaskStatus(${task.id}, 'in_progress')">
                                <i class="bi bi-arrow-repeat text-info me-2"></i>In Progress
                            </a></li>
                            <li><a class="dropdown-item" href="#" onclick="updateTaskStatus(${task.id}, 'completed')">
                                <i class="bi bi-check-circle text-success me-2"></i>Completed
                            </a></li>
                        </ul>
                    </div>
                </td>
                <td>
                    <span class="${isOverdue(task) ? 'text-danger' : ''}">${formatDate(task.deadline)}</span>
                    ${isOverdue(task) ? '<br><small class="text-danger"><i class="bi bi-exclamation-triangle"></i> Overdue</small>' : ''}
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-info" onclick="viewTaskDetails(${task.id})" title="View Details">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-outline-primary" onclick="editTask(${task.id})" title="Edit Task">
                            <i class="bi bi-pencil"></i>
                        </button>
                        ${window.currentUser && window.currentUser.role === 'admin' ? `
                            <button class="btn btn-outline-danger" onclick="deleteTask(${task.id})" title="Delete Task">
                                <i class="bi bi-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Toggle all checkboxes
    window.toggleAllTaskCheckboxes = function(selectAll) {
        const checkboxes = document.querySelectorAll('input[name="taskCheckbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAll;
        });
    };

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + N for new task
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            if (window.currentUser && window.currentUser.role === 'admin') {
                showCreateTaskModal();
            }
        }
        
        // Ctrl/Cmd + U for new user
        if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
            e.preventDefault();
            if (window.currentUser && window.currentUser.role === 'admin') {
                showCreateUserModal();
            }
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal.show');
            modals.forEach(modal => {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) bsModal.hide();
            });
        }
    });

    // Auto-save form data to localStorage (draft functionality)
    function saveFormDraft(formId, data) {
        localStorage.setItem(`draft_${formId}`, JSON.stringify(data));
    }

    function loadFormDraft(formId) {
        const draft = localStorage.getItem(`draft_${formId}`);
        return draft ? JSON.parse(draft) : null;
    }

    function clearFormDraft(formId) {
        localStorage.removeItem(`draft_${formId}`);
    }

    // Enhanced form validation
    function validateTaskForm(formData) {
        const errors = [];
        
        if (!formData.title.trim()) {
            errors.push('Title is required');
        }
        
        if (!formData.description.trim()) {
            errors.push('Description is required');
        }
        
        if (!formData.deadline) {
            errors.push('Deadline is required');
        } else if (new Date(formData.deadline) < new Date()) {
            errors.push('Deadline cannot be in the past');
        }
        
        if (!formData.assigned_to) {
            errors.push('Please assign the task to a user');
        }
        
        return errors;
    }

    function validateUserForm(formData) {
        const errors = [];
        
        if (!formData.name.trim()) {
            errors.push('Name is required');
        }
        
        if (!formData.email.trim()) {
            errors.push('Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.push('Please enter a valid email address');
        }
        
        if (formData.password && formData.password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }
        
        return errors;
    }

    // Real-time notifications (if implemented)
    function showNotification(title, message, type = 'info') {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: '/favicon.ico'
            });
        }
    }

    // Request notification permission
    function requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    // Initialize enhanced features
    document.addEventListener('DOMContentLoaded', function() {
        requestNotificationPermission();
        
        // Add tooltips to buttons
        const tooltips = document.querySelectorAll('[title]');
        tooltips.forEach(el => {
            new bootstrap.Tooltip(el);
        });
        
        // Auto-refresh data every 5 minutes
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                console.log('Auto-refreshing data...');
                loadTasks();
                if (window.currentUser && window.currentUser.role === 'admin') {
                    loadUsers();
                }
            }
        }, 5 * 60 * 1000); // 5 minutes
    });

}