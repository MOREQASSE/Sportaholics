<script>
    // User credentials
    const users = {
        'reqasse@gmail.com': { 
            password: 'messi101',
            name: 'Mohammed',
            column: 'D' // Columns start from D for data
        },
        'ilyasssabir@gmail.com': { 
            password: 'ilyass1999',
            name: 'Ilyass', 
            column: 'E'
        },
        'souhayl4011@gmail.com': { 
            password: 'souhayl2003',
            name: 'Souhayl',
            column: 'F'
        },
        'hamzaboutchich@gmail.com': { 
            password: 'hamza2003',
            name: 'Hamza',
            column: 'G'
        }
    };

    // Google Sheets Configuration - YOU WILL NEED TO UPDATE THESE
    const SPREADSHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; // You'll get this from your Google Sheet URL
    const API_KEY = 'YOUR_GOOGLE_API_KEY_HERE'; // You'll create this in Google Cloud Console

    // DOM Elements
    const loginScreen = document.getElementById('loginScreen');
    const appScreen = document.getElementById('appScreen');
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const userWelcome = document.getElementById('userWelcome');
    const workoutGrid = document.getElementById('workoutGrid');
    const logoutBtn = document.getElementById('logoutBtn');

    let currentUser = null;
    let workoutData = [];

    // Check if user is already logged in
    function checkExistingLogin() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser && users[savedUser]) {
            currentUser = savedUser;
            showAppScreen(savedUser);
        }
    }

    // Login form handler
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (users[email] && users[email].password === password) {
            currentUser = email;
            localStorage.setItem('currentUser', email);
            await showAppScreen(email);
        } else {
            errorMessage.style.display = 'block';
        }
    });

    // Show main application screen
    async function showAppScreen(email) {
        const user = users[email];
        loginScreen.style.display = 'none';
        appScreen.style.display = 'block';
        
        userWelcome.textContent = `Welcome, ${user.name}! Ready to dominate? 💪`;
        
        // Load workout data from Google Sheets
        await loadWorkoutData();
        renderWorkoutGrid(user);
    }

    // Load workout data from Google Sheets
    async function loadWorkoutData() {
        try {
            // For now, we'll use mock data. Replace this with actual Sheets API call
            workoutData = await getMockWorkoutData();
            
            // Uncomment this when you have your Google Sheets setup:
            // workoutData = await fetchSheetData();
            
        } catch (error) {
            console.error('Error loading workout data:', error);
            // Fallback to mock data
            workoutData = await getMockWorkoutData();
        }
    }

    // Mock data for testing (remove when Sheets is ready)
    async function getMockWorkoutData() {
        return [
            { 
                exercise: 'Pushups (Standard)', 
                target: '4x25',
                Mohammed: '❌', Ilyass: '✅', Souhayl: '❌', Hamza: '✅'
            },
            { 
                exercise: 'Pushups (Wide)', 
                target: '4x25',
                Mohammed: '✅', Ilyass: '❌', Souhayl: '✅', Hamza: '❌'
            },
            { 
                exercise: 'Pushups (Diamond)', 
                target: '4x25',
                Mohammed: '❌', Ilyass: '❌', Souhayl: '✅', Hamza: '✅'
            },
            { 
                exercise: 'Squats (Standard)', 
                target: '4x25',
                Mohammed: '✅', Ilyass: '✅', Souhayl: '❌', Hamza: '❌'
            },
            { 
                exercise: 'Squats (Pulse)', 
                target: '4x25',
                Mohammed: '❌', Ilyass: '✅', Souhayl: '✅', Hamza: '✅'
            }
        ];
    }

    // Actual Google Sheets API call (commented out for now)
    async function fetchSheetData() {
        const range = 'WorkoutData!A:G'; // Adjust range based on your sheet
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        // Transform Sheets data to our format
        const headers = data.values[0]; // First row: Exercise, Target, Mohammed, Ilyass, etc.
        return data.values.slice(1).map(row => {
            const obj = { exercise: row[0], target: row[1] };
            headers.slice(2).forEach((header, index) => {
                obj[header] = row[index + 2] || '❌';
            });
            return obj;
        });
    }

    // Render workout exercises with interactive checkboxes
    function renderWorkoutGrid(currentUser) {
        workoutGrid.innerHTML = '';
        
        workoutData.forEach((exercise, index) => {
            const exerciseCard = document.createElement('div');
            exerciseCard.className = 'exercise-card';
            
            const userStatus = exercise[currentUser.name];
            const isCompleted = userStatus === '✅';
            
            exerciseCard.innerHTML = `
                <div class="exercise-header">
                    <div class="exercise-name">${exercise.exercise}</div>
                    <div class="exercise-target">${exercise.target}</div>
                </div>
                <div class="progress-container">
                    <div class="user-progress">
                        <div class="progress-row">
                            <span class="user-label">You (${currentUser.name}):</span>
                            <button class="check-btn ${isCompleted ? 'completed' : ''}" 
                                    data-exercise="${exercise.exercise}">
                                ${isCompleted ? '✅ Completed' : '❌ Mark Complete'}
                            </button>
                        </div>
                        ${Object.entries(users)
                            .filter(([email, user]) => user.name !== currentUser.name)
                            .map(([email, user]) => `
                                <div class="progress-row">
                                    <span class="user-label">${user.name}:</span>
                                    <span class="status ${exercise[user.name] === '✅' ? 'completed' : 'pending'}">
                                        ${exercise[user.name] === '✅' ? '✅ Completed' : '⏳ Pending'}
                                    </span>
                                </div>
                            `).join('')}
                    </div>
                </div>
            `;
            
            workoutGrid.appendChild(exerciseCard);
        });

        // Add event listeners to check buttons
        document.querySelectorAll('.check-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const exerciseName = this.getAttribute('data-exercise');
                toggleExerciseCompletion(exerciseName, this);
            });
        });

        updateProgressDashboard(currentUser);
    }

    // Toggle exercise completion status
    function toggleExerciseCompletion(exerciseName, button) {
        const isCompleted = button.classList.contains('completed');
        
        if (!isCompleted) {
            // Mark as completed
            button.classList.add('completed');
            button.innerHTML = '✅ Completed';
            
            // Add celebration effect
            button.style.transform = 'scale(1.1)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 200);
            
            // Update local data
            const exercise = workoutData.find(e => e.exercise === exerciseName);
            if (exercise) {
                exercise[currentUser.name] = '✅';
            }
            
            // Here you would also update Google Sheets
            // updateSheetExercise(exerciseName, '✅');
            
        } else {
            // Mark as not completed
            button.classList.remove('completed');
            button.innerHTML = '❌ Mark Complete';
            
            // Update local data
            const exercise = workoutData.find(e => e.exercise === exerciseName);
            if (exercise) {
                exercise[currentUser.name] = '❌';
            }
            
            // Here you would also update Google Sheets  
            // updateSheetExercise(exerciseName, '❌');
        }
        
        updateProgressDashboard(users[currentUser]);
    }

    // Update progress dashboard
    function updateProgressDashboard(user) {
        const userExercises = workoutData.filter(exercise => 
            exercise[user.name] === '✅'
        ).length;
        
        const totalExercises = workoutData.length;
        const completionPercent = Math.round((userExercises / totalExercises) * 100);
        
        // Update progress section
        const progressSection = document.querySelector('.progress-section');
        progressSection.innerHTML = `
            <h2>🏆 Live Leaderboard</h2>
            <div class="dashboard-cards">
                <div class="stat-card">
                    <div class="stat-value">${userExercises}/${totalExercises}</div>
                    <div class="stat-label">Your Progress</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${completionPercent}%"></div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${getUserRank(user.name)}</div>
                    <div class="stat-label">Your Rank</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${getTeamCompletion()}%</div>
                    <div class="stat-label">Team Completion</div>
                </div>
            </div>
            <div class="leaderboard">
                <h3>Current Standings</h3>
                ${generateLeaderboard()}
            </div>
        `;
    }

    // Calculate user rank
    function getUserRank(userName) {
        const scores = Object.values(users).map(user => {
            const completed = workoutData.filter(exercise => 
                exercise[user.name] === '✅'
            ).length;
            return { name: user.name, completed };
        });
        
        scores.sort((a, b) => b.completed - a.completed);
        const rank = scores.findIndex(score => score.name === userName) + 1;
        
        switch(rank) {
            case 1: return '1st 🥇';
            case 2: return '2nd 🥈';
            case 3: return '3rd 🥉';
            case 4: return '4th 💪';
            default: return `${rank}th`;
        }
    }

    // Calculate team completion percentage
    function getTeamCompletion() {
        let totalCompleted = 0;
        let totalPossible = workoutData.length * Object.keys(users).length;
        
        workoutData.forEach(exercise => {
            Object.values(users).forEach(user => {
                if (exercise[user.name] === '✅') {
                    totalCompleted++;
                }
            });
        });
        
        return Math.round((totalCompleted / totalPossible) * 100);
    }

    // Generate leaderboard HTML
    function generateLeaderboard() {
        const scores = Object.values(users).map(user => {
            const completed = workoutData.filter(exercise => 
                exercise[user.name] === '✅'
            ).length;
            return { name: user.name, completed, total: workoutData.length };
        });
        
        scores.sort((a, b) => b.completed - a.completed);
        
        return scores.map((user, index) => `
            <div class="leaderboard-item ${user.name === users[currentUser].name ? 'current-user' : ''}">
                <div class="rank">${index + 1}</div>
                <div class="user-name">${user.name} ${user.name === users[currentUser].name ? '(You)' : ''}</div>
                <div class="user-score">${user.completed}/${user.total}</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(user.completed/user.total)*100}%"></div>
                </div>
            </div>
        `).join('');
    }

    // Logout functionality
    logoutBtn.addEventListener('click', function() {
        currentUser = null;
        localStorage.removeItem('currentUser');
        appScreen.style.display = 'none';
        loginScreen.style.display = 'flex';
        loginForm.reset();
        errorMessage.style.display = 'none';
    });

    // Initialize app
    checkExistingLogin();
</script>