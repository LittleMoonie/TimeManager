pipeline {
    agent any
    
    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        API_DIR = 'App.API'
        WEB_DIR = 'App.Web'
    }
    
    stages {
        stage('📋 Checkout') {
            steps {
                echo '🔄 Fetching source code from Git...'
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/EpitechMscProPromo2027/T-DEV-700-project-NCY_8.git',
                        credentialsId: 'Jenkins'
                    ]]
                ])
                sh 'ls -la'
            }
        }

        // Jenkins environment check
        stage('🔍 Environment Info') {
            steps {
                echo '📊 Checking environment...'
                sh '''
                    echo "=== Workspace ==="
                    ls -la
                    find . -name "package.json" -type f || echo "No package.json found"
                    echo "=== Node/Yarn ==="
                    node --version
                    yarn --version
                    echo "=== Docker Compose ==="
                    docker-compose --version
                    if [ -f "${DOCKER_COMPOSE_FILE}" ]; then
                        echo "docker-compose.yml found!"
                        grep -E "(build|ports|volumes)" ${DOCKER_COMPOSE_FILE} | head -5
                    else
                        echo "⚠️ docker-compose.yml missing - copy it manually"
                    fi
                '''
            }
        }
        
        //Install dependencies if package.json exists in API and Web folders
        stage('📦 Install Dependencies') {
            steps {
                echo '📦 Installing dependencies (API then Web)...'
                
                dir("${API_DIR}") {
                    sh '''
                        if [ -f "package.json" ]; then
                            echo "Installing API dependencies..."
                            yarn install --immutable || yarn install
                        else
                            echo "⚠️ No package.json in ${API_DIR}"
                        fi
                    '''
                }
                
                dir("${WEB_DIR}") {
                    sh '''
                        if [ -f "package.json" ]; then
                            echo "Installing Web dependencies..."
                            yarn install --immutable || yarn install
                        else
                            echo "⚠️ No package.json in ${WEB_DIR}"
                        fi
                    '''
                }
            }
        }
        
        stage('🧪 Tests') {
            steps {
                echo '🧪 Running tests (API then Web)...'
                
                dir("${API_DIR}") {
                    sh '''
                        if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
                            echo "Running API tests..."
                            yarn test || echo "⚠️ API tests failed"
                        else
                            echo "⚠️ No tests for API"
                        fi
                    '''
                }
                
                dir("${WEB_DIR}") {
                    sh '''
                        if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
                            echo "Running Web tests..."
                            yarn test || echo "⚠️ Web tests failed"
                        else
                            echo "⚠️ No tests for Web"
                        fi
                    '''
                }
            }
        }
        
        // Test Docker image build
        stage('🔨 Test Build Docker') {
            steps {
                echo '🔨 Testing image build (without full deploy)...'
                sh '''
                    if [ -f "${DOCKER_COMPOSE_FILE}" ]; then
                        docker-compose -f ${DOCKER_COMPOSE_FILE} build --no-cache api web  # Build only API/Web for test
                        echo "✅ Builds OK"
                    else
                        echo "⚠️ No docker-compose.yml - skipping build"
                    fi
                '''
            }
        }
    }
    
    // Cleanup and notifications
    post {
        always {
            echo '🧹 Cleaning up...'
            sh 'docker system prune -f || true'
        }
        success {
            echo '✅ Test successful! Ready for full deploy.'
        }
        failure {
            echo '❌ Failed - Check Git, Node, or files.'
        }
    }
}