// Dashboard JavaScript - Clean Final Version

if (typeof window.dashboardLoaded === 'undefined') {
    window.dashboardLoaded = true;
    
    let tasks = [];
    let users = [];
    let currentEditingTask = null;
    let currentEditingUser = null;
    let currentViewingTask = null;

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
            window.currentUser = JSON.parse(userString);
            console.log('Current user:', window.currentUser);
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            window.location.href = '/';
            return;
        }

        updateUserInfo();
        toggleAdminElements();
        setupEventListeners();
        loadDashboardData();
    }

    function updateUserInfo() {
        const userNameEl = document.getElementById('sidebarUserName');
        const userRoleEl = document.getElementById('sidebarUserRole');

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

        // Edit task form
        const editTaskForm = document.getElementById('editTaskForm');
        if (editTaskForm) {
            editTaskForm.addEventListener('submit', handleEditTask);
        }

        // Edit user form
        const editUserForm = document.getElementById('editUserForm');
        if (editUserForm) {
            editUserForm.addEventListener('submit', handleEditUser);
        }
    }

    async function loadDashboardData() {
        console.log('Loading dashboard data...');
        await loadTasks();
        
        if (window.currentUser && window.currentUser.role === 'admin') {
            await loadUsers();
        }
        
        updateDashboardStats();
    }

    async function loadTasks() {
        console.log('Loading tasks...');
        
        try {
            const mockTasks = [
                {
                    id: 1,
                    title: "Design Homepage",
                    description: "Create a modern and responsive homepage design",
                    status: "pending",
                    deadline: "2025-07-20",
                    assigned_user: { id: 1, name: "John Doe" },
                    created_at: "2025-01-01T00:00:00.000Z"
                },
                {
                    id: 2,
                    title: "Database Optimization",
                    description: "Optimize database queries and improve performance",
                    status: "in_progress",
                    deadline: "2025-07-25",
                    assigned_user: { id: 2, name: "Jane Smith" },
                    created_at: "2025-01-02T00:00:00.000Z"
                },
                {
                    id: 3,
                    title: "API Documentation",
                    description: "Write comprehensive API documentation",
                    status: "completed",
                    deadline: "2025-07-23",
                    assigned_user: { id: 1, name: "John Doe" },
                    created_at: "2025-01-03T00:00:00.000Z"
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

    async function loadUsers() {
        if (!window.currentUser || window.currentUser.role !== 'admin') return;
        
        console.log('Loading users...');
        
        try {
            
            // Try API request first
            if (window.TaskManager) {
                try {
                    const response = await window.TaskManager.apiRequest('/users');
                    if (response && Array.isArray(response)) {
                        users = response;
                        console.log('Loaded users from API:', users);
                    } else {
                        console.log('API returned no data, cannot load users');
                        users = [];
                    }
                } catch (error) {
                    console.log('API request failed:', error.message);
                    users = [];
                }
            } else {
                console.log('TaskManager not available, cannot load users');
                users = [];
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

        loadRecentTasks();
    }

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

        tbody.innerHTML = users.map(user => {
            const isCurrentUser = window.currentUser && window.currentUser.id === user.id;
            return `
                <tr class="${isCurrentUser ? 'table-primary' : ''}">
                    <td>
                        ${user.name || 'Unknown User'}
                        ${isCurrentUser ? '<span class="badge bg-primary ms-2">You</span>' : ''}
                    </td>
                    <td>${user.email || 'No Email'}</td>
                    <td>
                        <span class="badge ${user.role === 'admin' ? 'bg-danger' : 'bg-secondary'}">${user.role || 'user'}</span>
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" onclick="editUser(${user.id})" title="Edit User">
                                <i class="bi bi-pencil"></i>
                            </button>
                            ${!isCurrentUser ? `
                                <button class="btn btn-outline-danger" onclick="deleteUser(${user.id})" title="Delete User">
                                    <i class="bi bi-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function populateUserSelect() {
        const select = document.getElementById('taskAssignee');
        if (!select) return;

        select.innerHTML = '<option value="">Select User</option>';
        users.forEach(user => {
            select.innerHTML += `<option value="${user.id}">${user.name} (${user.email})</option>`;
        });
    }

    function populateEditTaskAssignee() {
        const select = document.getElementById('editTaskAssignee');
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
            
            // Add to local tasks array
            const newTask = {
                id: tasks.length + Date.now(),
                title: formData.title,
                description: formData.description,
                status: 'pending',
                deadline: formData.deadline,
                assigned_user: users.find(u => u.id == formData.assigned_to) || null,
                created_at: new Date().toISOString()
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

    // Handle create user form submission
    async function handleCreateUser(e) {
        e.preventDefault();
        
        const password = document.getElementById('userPassword').value;
        const passwordConfirm = document.getElementById('userPasswordConfirm').value;
        
        if (password !== passwordConfirm) {
            showFormError('createUserError', 'Passwords do not match');
            return;
        }

        const formData = {
            name: document.getElementById('userName').value.trim(),
            email: document.getElementById('userEmail').value.trim(),
            password: password,
            password_confirmation: passwordConfirm,
            role: document.getElementById('userRole').value
        };

        // Validate required fields
        if (!formData.name) {
            showFormError('createUserError', 'Name is required');
            return;
        }

        if (!formData.email) {
            showFormError('createUserError', 'Email is required');
            return;
        }

        if (!formData.role) {
            showFormError('createUserError', 'Role is required');
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const errorDiv = document.getElementById('createUserError');

        try {
            if (window.TaskManager) {
                window.TaskManager.setLoading(submitBtn, true);
            }
            if (errorDiv) errorDiv.classList.add('d-none');

            console.log('Creating user with data:', formData);

            // Send to backend API
            if (window.TaskManager) {
                await window.TaskManager.apiRequest('/users', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
            }

            if (window.TaskManager) {
                window.TaskManager.showAlert('User created successfully!', 'success');
            }
            
            // Close modal and reset form
            const modal = bootstrap.Modal.getInstance(document.getElementById('createUserModal'));
            if (modal) modal.hide();
            e.target.reset();
            
            // Reload users from backend
            await loadUsers();

        } catch (error) {
            console.error('Error creating user:', error);
            showFormError('createUserError', error.message || 'An error occurred while creating the user');
        } finally {
            if (window.TaskManager) {
                window.TaskManager.setLoading(submitBtn, false);
            }
        }
    }

    // Updated Edit Task Function - STRICT Requirements Compliance
    window.editTask = async function(taskId) {
        console.log('Editing task with ID:', taskId);
        
        const task = tasks.find(t => t.id === taskId);
        if (!task) {
            if (window.TaskManager) {
                window.TaskManager.showAlert('Task not found!', 'danger');
            }
            return;
        }
        
        currentEditingTask = task;
        
        // Check if user can edit this task
        const isAdmin = window.currentUser && window.currentUser.role === 'admin';
        const isAssignedUser = task.assigned_user && task.assigned_user.id === window.currentUser.id;
        
        if (!isAdmin && !isAssignedUser) {
            if (window.TaskManager) {
                window.TaskManager.showAlert('You can only edit tasks assigned to you!', 'warning');
            }
            return;
        }
        
        // Populate the edit modal
        document.getElementById('editTaskTitle').value = task.title;
        document.getElementById('editTaskDescription').value = task.description;
        document.getElementById('editTaskStatus').value = task.status;
        
        // Show/hide fields based on user role
        const adminFields = document.querySelectorAll('.admin-only-field');
        const userFields = document.querySelectorAll('.user-only-field');
        
        if (isAdmin) {
            // Admin can edit everything
            adminFields.forEach(field => field.style.display = 'block');
            userFields.forEach(field => field.style.display = 'none');
            
            // Populate admin fields
            document.getElementById('editTaskAssignee').value = task.assigned_user ? task.assigned_user.id : '';
            document.getElementById('editTaskDeadline').value = task.deadline;
            
            // Populate assignee dropdown
            populateEditTaskAssignee();
            
            // Admin can edit all fields
            document.getElementById('editTaskTitle').removeAttribute('readonly');
            document.getElementById('editTaskDescription').removeAttribute('readonly');
        } else {
            // Regular user - ONLY STATUS according to requirements
            adminFields.forEach(field => field.style.display = 'none');
            userFields.forEach(field => field.style.display = 'block');
            
            // Show deadline as read-only
            document.getElementById('editTaskDeadlineReadonly').value = formatDate(task.deadline);
            
            // According to requirements: "Users should be able to view tasks assigned to them and update the status of the task"
            // This means ONLY status can be changed, title and description should be read-only
            document.getElementById('editTaskTitle').setAttribute('readonly', true);
            document.getElementById('editTaskDescription').setAttribute('readonly', true);
            
            // Add visual indicators for read-only fields
            document.getElementById('editTaskTitle').style.backgroundColor = '#f8f9fa';
            document.getElementById('editTaskDescription').style.backgroundColor = '#f8f9fa';
        }
        
        // Show the edit modal
        const modal = new bootstrap.Modal(document.getElementById('editTaskModal'));
        modal.show();
    };

    // Updated Handle Edit Task Function - STRICT Requirements Compliance
    async function handleEditTask(e) {
        e.preventDefault();
        
        if (!currentEditingTask) {
            console.error('No task being edited');
            return;
        }
        
        const isAdmin = window.currentUser && window.currentUser.role === 'admin';
        const isAssignedUser = currentEditingTask.assigned_user && 
                              currentEditingTask.assigned_user.id === window.currentUser.id;
        
        // Check permissions
        if (!isAdmin && !isAssignedUser) {
            showFormError('editTaskError', 'You can only edit tasks assigned to you');
            return;
        }
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const errorDiv = document.getElementById('editTaskError');

        try {
            if (window.TaskManager) {
                window.TaskManager.setLoading(submitBtn, true);
            }
            if (errorDiv) errorDiv.classList.add('d-none');

            let endpoint, method, requestBody;
            
            if (isAdmin) {
                // Admin can update everything
                const formData = {
                    title: document.getElementById('editTaskTitle').value,
                    description: document.getElementById('editTaskDescription').value,
                    status: document.getElementById('editTaskStatus').value,
                    assigned_to: document.getElementById('editTaskAssignee').value,
                    deadline: document.getElementById('editTaskDeadline').value
                };
                
                endpoint = `/tasks/${currentEditingTask.id}`;
                method = 'PUT';
                requestBody = formData;
            } else {
                // Regular user - ONLY STATUS UPDATE per requirements
                // "Users should be able to view tasks assigned to them and update the status of the task"
                const statusOnly = {
                    status: document.getElementById('editTaskStatus').value
                };
                
                endpoint = `/tasks/${currentEditingTask.id}/status`;
                method = 'PATCH';
                requestBody = statusOnly;
            }

            console.log('Sending request:', { endpoint, method, requestBody });

            // Try API request first
            if (window.TaskManager) {
                try {
                    await window.TaskManager.apiRequest(endpoint, {
                        method: method,
                        body: JSON.stringify(requestBody)
                    });
                    console.log('Task updated via API');
                } catch (error) {
                    console.log('API update failed, updating locally:', error.message);
                }
            }

            // Update local data
            const taskIndex = tasks.findIndex(t => t.id === currentEditingTask.id);
            if (taskIndex !== -1) {
                if (isAdmin) {
                    // Admin can update everything
                    tasks[taskIndex] = {
                        ...tasks[taskIndex],
                        title: requestBody.title,
                        description: requestBody.description,
                        status: requestBody.status,
                        deadline: requestBody.deadline,
                        assigned_user: users.find(u => u.id == requestBody.assigned_to) || tasks[taskIndex].assigned_user,
                        updated_at: new Date().toISOString()
                    };
                } else {
                    // Regular user - ONLY STATUS UPDATE
                    // Title, description, deadline, and assignment remain unchanged
                    tasks[taskIndex] = {
                        ...tasks[taskIndex],
                        status: requestBody.status,
                        updated_at: new Date().toISOString()
                        // All other fields (title, description, deadline, assigned_user) remain unchanged
                    };
                }
            }

            if (window.TaskManager) {
                const message = isAdmin ? 'Task updated successfully!' : 'Task status updated successfully!';
                window.TaskManager.showAlert(message, 'success');
            }
            
            // Close modal and reset
            const modal = bootstrap.Modal.getInstance(document.getElementById('editTaskModal'));
            if (modal) modal.hide();
            currentEditingTask = null;
            
            // Reload data
            renderTasksTable();
            updateDashboardStats();

        } catch (error) {
            console.error('Error updating task:', error);
            showFormError('editTaskError', error.message || 'An error occurred while updating the task');
        } finally {
            if (window.TaskManager) {
                window.TaskManager.setLoading(submitBtn, false);
            }
        }
    }

    // Handle edit user form submission
    async function handleEditUser(e) {
        e.preventDefault();
        
        if (!currentEditingUser) {
            console.error('No user being edited');
            return;
        }
        
        const formData = {
            name: document.getElementById('editUserName').value.trim(),
            email: document.getElementById('editUserEmail').value.trim(),
            role: document.getElementById('editUserRole').value
        };

        // Validate required fields
        if (!formData.name) {
            showFormError('editUserError', 'Name is required');
            return;
        }

        if (!formData.email) {
            showFormError('editUserError', 'Email is required');
            return;
        }

        if (!formData.role) {
            showFormError('editUserError', 'Role is required');
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');

        try {
            if (window.TaskManager) {
                window.TaskManager.setLoading(submitBtn, true);
            }
            document.getElementById('editUserError').classList.add('d-none');

            // Update local data
            const userIndex = users.findIndex(u => u.id === currentEditingUser.id);
            if (userIndex !== -1) {
                users[userIndex] = {
                    ...users[userIndex],
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                    updated_at: new Date().toISOString()
                };
                console.log('Updated user:', users[userIndex]);
            }

            // Update currentUser if editing own profile
            if (window.currentUser && window.currentUser.id === currentEditingUser.id) {
                window.currentUser.name = formData.name;
                window.currentUser.email = formData.email;
                window.currentUser.role = formData.role;
                localStorage.setItem('currentUser', JSON.stringify(window.currentUser));
                updateUserInfo();
            }

            if (window.TaskManager) {
                window.TaskManager.showAlert('User updated successfully!', 'success');
            }
            
            // Close modal and reset
            const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
            if (modal) modal.hide();
            e.target.reset();
            currentEditingUser = null;
            
            // Reload data
            renderUsersTable();
            populateUserSelect();
            populateEditTaskAssignee();

        } catch (error) {
            console.error('Error updating user:', error);
            showFormError('editUserError', error.message || 'An error occurred while updating the user');
        } finally {
            if (window.TaskManager) {
                window.TaskManager.setLoading(submitBtn, false);
            }
        }
    }

    // Helper function to show form errors
    function showFormError(errorDivId, message) {
        const errorDiv = document.getElementById(errorDivId);
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.remove('d-none');
        }
    }

    // Utility functions
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

    // Global functions
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

    // Edit Task Function
    window.editTask = async function(taskId) {
        console.log('Editing task with ID:', taskId);
        
        const task = tasks.find(t => t.id === taskId);
        if (!task) {
            if (window.TaskManager) {
                window.TaskManager.showAlert('Task not found!', 'danger');
            }
            return;
        }
        
        currentEditingTask = task;
        
        // Populate the edit modal
        document.getElementById('editTaskTitle').value = task.title;
        document.getElementById('editTaskDescription').value = task.description;
        document.getElementById('editTaskStatus').value = task.status;
        
        // Show/hide fields based on user role
        const adminFields = document.querySelectorAll('.admin-only-field');
        const userFields = document.querySelectorAll('.user-only-field');
        
        if (window.currentUser && window.currentUser.role === 'admin') {
            // Admin can edit everything
            adminFields.forEach(field => field.style.display = 'block');
            userFields.forEach(field => field.style.display = 'none');
            
            // Populate admin fields
            document.getElementById('editTaskAssignee').value = task.assigned_user ? task.assigned_user.id : '';
            document.getElementById('editTaskDeadline').value = task.deadline;
            
            // Populate assignee dropdown
            populateEditTaskAssignee();
        } else {
            // Regular user - limited editing
            adminFields.forEach(field => field.style.display = 'none');
            userFields.forEach(field => field.style.display = 'block');
            
            // Show deadline as read-only
            document.getElementById('editTaskDeadlineReadonly').value = formatDate(task.deadline);
            
            // Disable title and description for assigned tasks if user is not the assignee
            if (task.assigned_user && task.assigned_user.id !== window.currentUser.id) {
                document.getElementById('editTaskTitle').setAttribute('readonly', true);
                document.getElementById('editTaskDescription').setAttribute('readonly', true);
            } else {
                document.getElementById('editTaskTitle').removeAttribute('readonly');
                document.getElementById('editTaskDescription').removeAttribute('readonly');
            }
        }
        
        // Show the edit modal
        const modal = new bootstrap.Modal(document.getElementById('editTaskModal'));
        modal.show();
    };

    // Delete Task Function
    window.deleteTask = async function(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) {
            if (window.TaskManager) {
                window.TaskManager.showAlert('Task not found!', 'danger');
            }
            return;
        }

        // Show confirmation modal
        document.getElementById('deleteConfirmMessage').textContent = `Are you sure you want to delete task "${task.title}"? This action cannot be undone.`;
        
        const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
        deleteModal.show();
        
        // Set up the delete button action
        const deleteBtn = document.getElementById('deleteConfirmBtn');
        deleteBtn.onclick = async function() {
            deleteModal.hide();
            
            try {
                // Try API request first
                if (window.TaskManager) {
                    try {
                        await window.TaskManager.apiRequest(`/tasks/${taskId}`, {
                            method: 'DELETE'
                        });
                        console.log('Task deleted via API');
                    } catch (error) {
                        console.log('API delete failed, deleting locally:', error.message);
                    }
                }
                
                // Remove from local array
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
    };

    // Edit User Function
    window.editUser = async function(userId) {
        console.log('Editing user with ID:', userId);
        
        const user = users.find(u => u.id === userId);
        if (!user) {
            if (window.TaskManager) {
                window.TaskManager.showAlert('User not found!', 'danger');
            }
            return;
        }
        
        currentEditingUser = user;
        
        // Populate the edit modal
        document.getElementById('editUserName').value = user.name;
        document.getElementById('editUserEmail').value = user.email;
        document.getElementById('editUserRole').value = user.role;
        
        // Clear password fields
        document.getElementById('editUserPassword').value = '';
        document.getElementById('editUserPasswordConfirm').value = '';
        
        // Show the edit modal
        const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
        modal.show();
    };

    // Delete User Function
    window.deleteUser = async function(userId) {
        const user = users.find(u => u.id === userId);
        
        if (!user) {
            if (window.TaskManager) {
                window.TaskManager.showAlert('User not found!', 'danger');
            }
            return;
        }
        
        // Prevent deleting the current user
        if (window.currentUser && window.currentUser.id === userId) {
            if (window.TaskManager) {
                window.TaskManager.showAlert('You cannot delete your own account!', 'warning');
            }
            return;
        }
        
        // Show confirmation modal
        document.getElementById('deleteConfirmMessage').textContent = `Are you sure you want to delete user "${user.name}"? This action cannot be undone.`;
        
        const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
        deleteModal.show();
        
        // Set up the delete button action
        const deleteBtn = document.getElementById('deleteConfirmBtn');
        deleteBtn.onclick = async function() {
            deleteModal.hide();
            
            try {
                // Try API request first
                if (window.TaskManager) {
                    try {
                        await window.TaskManager.apiRequest(`/users/${userId}`, {
                            method: 'DELETE'
                        });
                        console.log('User deleted via API');
                    } catch (error) {
                        console.log('API delete failed, deleting locally:', error.message);
                    }
                }
                
                // Remove from local array
                users = users.filter(u => u.id !== userId);
                
                if (window.TaskManager) {
                    window.TaskManager.showAlert('User deleted successfully!', 'success');
                }
                
                renderUsersTable();
                populateUserSelect();
                populateEditTaskAssignee();
            } catch (error) {
                console.error('Error deleting user:', error);
                if (window.TaskManager) {
                    window.TaskManager.showAlert('Error deleting user: ' + error.message, 'danger');
                }
            }
        };
    };

    // Update Task Status
    window.updateTaskStatus = async function(taskId, newStatus) {
        try {
            // Try API request first
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
            
            // Update local data
            const taskIndex = tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                tasks[taskIndex].status = newStatus;
            }
            
            if (window.TaskManager) {
                window.TaskManager.showAlert('Task status updated successfully!', 'success');
            }
            
            renderTasksTable();
            updateDashboardStats();
            
        } catch (error) {
            console.error('Error updating task status:', error);
            if (window.TaskManager) {
                window.TaskManager.showAlert('Error updating task status: ' + error.message, 'danger');
            }
        }
    };

    // View Task Details
    window.viewTaskDetails = function(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) {
            if (window.TaskManager) {
                window.TaskManager.showAlert('Task not found!', 'danger');
            }
            return;
        }
        
        currentViewingTask = task;
        
        // Populate task details modal
        document.getElementById('taskDetailTitle').textContent = task.title;
        document.getElementById('taskDetailDescription').textContent = task.description;
        document.getElementById('taskDetailStatus').innerHTML = `<span class="badge ${getStatusBadgeClass(task.status)}">${formatStatus(task.status)}</span>`;
        document.getElementById('taskDetailAssignee').textContent = task.assigned_user ? task.assigned_user.name : 'Unassigned';
        document.getElementById('taskDetailDeadline').textContent = formatDate(task.deadline);
        document.getElementById('taskDetailCreated').textContent = formatDate(task.created_at || new Date().toISOString());
        
        // Show overdue warning if applicable
        const overdueWarning = document.getElementById('taskDetailOverdue');
        if (overdueWarning) {
            if (isOverdue(task)) {
                overdueWarning.classList.remove('d-none');
            } else {
                overdueWarning.classList.add('d-none');
            }
        }
        
        // Show the details modal
        const modal = new bootstrap.Modal(document.getElementById('taskDetailsModal'));
        modal.show();
    };

    // Edit task from details modal
    window.editTaskFromDetails = function() {
        if (!currentViewingTask) {
            if (window.TaskManager) {
                window.TaskManager.showAlert('No task selected!', 'danger');
            }
            return;
        }
        
        // Close details modal first
        const detailsModal = bootstrap.Modal.getInstance(document.getElementById('taskDetailsModal'));
        if (detailsModal) detailsModal.hide();
        
        // Open edit modal
        setTimeout(() => {
            editTask(currentViewingTask.id);
        }, 300);
    };

    // Search Functions
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
        
        if (window.TaskManager) {
            window.TaskManager.showAlert(`Found ${filteredTasks.length} task(s) matching "${query}"`, 'info');
        }
    };

    window.searchUsers = function(query) {
        if (!query.trim()) {
            renderUsersTable();
            return;
        }
        
        const filteredUsers = users.filter(user => 
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase()) ||
            user.role.toLowerCase().includes(query.toLowerCase())
        );
        
        // Temporarily replace users for rendering
        const originalUsers = [...users];
        users = filteredUsers;
        renderUsersTable();
        users = originalUsers;
        
        if (window.TaskManager) {
            window.TaskManager.showAlert(`Found ${filteredUsers.length} user(s) matching "${query}"`, 'info');
        }
    };

    // Filter Functions
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
        
        if (window.TaskManager) {
            window.TaskManager.showAlert(`Showing ${filteredTasks.length} ${formatStatus(status)} task(s)`, 'info');
        }
    };

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
        
        if (window.TaskManager) {
            window.TaskManager.showAlert(`Showing ${filteredUsers.length} ${role}(s)`, 'info');
        }
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

 
    // Bulk Operations
    window.bulkDeleteTasks = function() {
        const checkboxes = document.querySelectorAll('input[name="taskCheckbox"]:checked');
        if (checkboxes.length === 0) {
            if (window.TaskManager) {
                window.TaskManager.showAlert('Please select tasks to delete', 'warning');
            }
            return;
        }
        
        // Show confirmation modal
        document.getElementById('deleteConfirmMessage').textContent = `Are you sure you want to delete ${checkboxes.length} task(s)? This action cannot be undone.`;
        
        const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
        deleteModal.show();
        
        // Set up the delete button action
        const deleteBtn = document.getElementById('deleteConfirmBtn');
        deleteBtn.onclick = function() {
            deleteModal.hide();
            
            const taskIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
            
            // Remove tasks from array
            tasks = tasks.filter(task => !taskIds.includes(task.id));
            
            renderTasksTable();
            updateDashboardStats();
            
            if (window.TaskManager) {
                window.TaskManager.showAlert(`${taskIds.length} task(s) deleted successfully!`, 'success');
            }
        };
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

 
    window.toggleAllTaskCheckboxes = function(selectAll) {
        const checkboxes = document.querySelectorAll('input[name="taskCheckbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAll;
        });
    };

  
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

  
    window.logout = async function() {
        try {
            if (window.TaskManager) {
                await window.TaskManager.logout();
            }
        } catch (error) {
            console.error('Logout error:', error);
         
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            window.location.href = '/';
        }
    };

   
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + N for new task
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            if (window.currentUser && window.currentUser.role === 'admin') {
                showCreateTaskModal();
            }
        }
   
        if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
            e.preventDefault();
            if (window.currentUser && window.currentUser.role === 'admin') {
                showCreateUserModal();
            }
        }
        
      
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal.show');
            modals.forEach(modal => {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) bsModal.hide();
            });
        }
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
    }, 5 * 60 * 1000); 

} 