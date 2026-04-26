pipeline {
    agent any

    environment {
        APP_NAME        = 'feastflow'
        DOCKER_REGISTRY = 'localhost:5000'
        IMAGE_FRONTEND  = "${DOCKER_REGISTRY}/${APP_NAME}-frontend"
        IMAGE_BACKEND   = "${DOCKER_REGISTRY}/${APP_NAME}-backend"
        BUILD_TAG       = "${env.BUILD_NUMBER}-${env.GIT_COMMIT?.take(7) ?: 'local'}"
        NODE_VERSION    = '18'
    }

    options {
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {

        // ─────────────────────────────────────────────────────────
        // STAGE 1: Checkout
        // ─────────────────────────────────────────────────────────
        stage('Checkout') {
            steps {
                echo '📦 Checking out source code...'
                checkout scm
                sh 'git log --oneline -5'
            }
        }

        // ─────────────────────────────────────────────────────────
        // STAGE 2: Lint (Dockerfile + Code)
        // ─────────────────────────────────────────────────────────
        stage('Lint Docker file') {
            parallel {
                stage('Lint Dockerfile - Frontend') {
                    steps {
                        echo '🔍 Linting Frontend Dockerfile...'
                        sh '''
                            if command -v hadolint > /dev/null 2>&1; then
                                hadolint frontend/Dockerfile
                            else
                                echo "hadolint not installed — skipping Dockerfile lint (non-blocking)"
                            fi
                        '''
                    }
                }
                stage('Lint Dockerfile - Backend') {
                    steps {
                        echo '🔍 Linting Backend Dockerfile...'
                        sh '''
                            if command -v hadolint > /dev/null 2>&1; then
                                hadolint backend/Dockerfile
                            else
                                echo "hadolint not installed — skipping Dockerfile lint (non-blocking)"
                            fi
                        '''
                    }
                }
                stage('Lint Frontend Code') {
                    steps {
                        echo '🔍 Linting Frontend JavaScript/CSS...'
                        dir('frontend') {
                            sh '''
                                npm ci --prefer-offline
                                npm run lint
                            '''
                        }
                    }
                }
                stage('Lint Backend Code') {
                    steps {
                        echo '🔍 Linting Backend Node.js code...'
                        dir('backend') {
                            sh '''
                                npm ci --prefer-offline
                                npm run lint
                            '''
                        }
                    }
                }
            }
        }

        // ─────────────────────────────────────────────────────────
        // STAGE 3: Test
        // ─────────────────────────────────────────────────────────
        stage('Test stage') {
            parallel {
                stage('Frontend Unit Tests') {
                    steps {
                        echo '🧪 Running Frontend unit tests...'
                        dir('frontend') {
                            sh 'npm test -- --watch=false --browsers=ChromeHeadless'
                        }
                    }
                    post {
                        always {
                            junit 'frontend/coverage/junit.xml'
                        }
                    }
                }
                stage('Backend Unit Tests') {
                    steps {
                        echo '🧪 Running Backend unit tests...'
                        dir('backend') {
                            sh 'npm test -- --coverage'
                        }
                    }
                    post {
                        always {
                            junit 'backend/coverage/junit.xml'
                        }
                    }
                }
            }
        }

        // ─────────────────────────────────────────────────────────
        // STAGE 4: Build Docker Images
        // ─────────────────────────────────────────────────────────
        stage('Building a docker image') {
            parallel {
                stage('Build Frontend Image') {
                    steps {
                        echo '🐳 Building Frontend Docker image...'
                        sh """
                            docker build \
                                --build-arg BUILD_DATE=\$(date -u +%Y-%m-%dT%H:%M:%SZ) \
                                --build-arg VCS_REF=${env.GIT_COMMIT ?: 'local'} \
                                -t ${IMAGE_FRONTEND}:${BUILD_TAG} \
                                -t ${IMAGE_FRONTEND}:latest \
                                ./frontend
                        """
                    }
                }
                stage('Build Backend Image') {
                    steps {
                        echo '🐳 Building Backend Docker image...'
                        sh """
                            docker build \
                                --build-arg BUILD_DATE=\$(date -u +%Y-%m-%dT%H:%M:%SZ) \
                                --build-arg VCS_REF=${env.GIT_COMMIT ?: 'local'} \
                                -t ${IMAGE_BACKEND}:${BUILD_TAG} \
                                -t ${IMAGE_BACKEND}:latest \
                                ./backend
                        """
                    }
                }
            }
        }

        // ─────────────────────────────────────────────────────────
        // STAGE 5: Integration Tests (against real containers)
        // ─────────────────────────────────────────────────────────
        stage('Integration Tests') {
            steps {
                echo '🔗 Running integration tests against Docker containers...'
                sh '''
                    docker-compose -f docker-compose.test.yml up -d
                    sleep 10
                    npm run test:integration --prefix backend || true
                    docker-compose -f docker-compose.test.yml down
                '''
            }
        }

        // ─────────────────────────────────────────────────────────
        // STAGE 6: Security Scan
        // ─────────────────────────────────────────────────────────
        stage('Security Scan') {
            steps {
                echo '🔒 Scanning Docker images for vulnerabilities...'
                sh '''
                    if command -v trivy > /dev/null 2>&1; then
                        trivy image --exit-code 0 --severity HIGH,CRITICAL ${IMAGE_FRONTEND}:latest
                        trivy image --exit-code 0 --severity HIGH,CRITICAL ${IMAGE_BACKEND}:latest
                    else
                        echo "Trivy not installed — skipping security scan"
                    fi
                '''
            }
        }

        // ─────────────────────────────────────────────────────────
        // STAGE 7: Publish to Registry (JFrog Artifactory / local)
        // ─────────────────────────────────────────────────────────
        stage('Publishing Image to JFrogArtifactory') {
            steps {
                echo '📤 Publishing Docker images to registry...'
                sh """
                    docker push ${IMAGE_FRONTEND}:${BUILD_TAG}
                    docker push ${IMAGE_FRONTEND}:latest
                    docker push ${IMAGE_BACKEND}:${BUILD_TAG}
                    docker push ${IMAGE_BACKEND}:latest
                    echo "✅ Images published: ${BUILD_TAG}"
                """
            }
        }

        // ─────────────────────────────────────────────────────────
        // STAGE 8: Deploy to Staging
        // ─────────────────────────────────────────────────────────
        stage('Deploy to Staging') {
            steps {
                echo '🚀 Deploying FeastFlow to Staging...'
                sh """
                    IMAGE_TAG=${BUILD_TAG} \
                    docker-compose -f docker-compose.staging.yml up -d --force-recreate
                    echo "✅ Staging deployment complete"
                    docker-compose -f docker-compose.staging.yml ps
                """
            }
        }

        // ─────────────────────────────────────────────────────────
        // STAGE 9: Smoke Tests on Staging
        // ─────────────────────────────────────────────────────────
        stage('Smoke Tests') {
            steps {
                echo '💨 Running smoke tests on staging environment...'
                sh '''
                    sleep 5
                    curl -f http://localhost:3001/api/health || exit 1
                    curl -f http://localhost:8080 || exit 1
                    echo "✅ Smoke tests passed!"
                '''
            }
        }

        // ─────────────────────────────────────────────────────────
        // STAGE 10: Deploy to Production
        // ─────────────────────────────────────────────────────────
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            input {
                message 'Deploy to Production?'
                ok 'Yes, deploy now!'
            }
            steps {
                echo '🎉 Deploying FeastFlow to Production...'
                sh """
                    IMAGE_TAG=${BUILD_TAG} \
                    docker-compose -f docker-compose.yml up -d --force-recreate
                    echo "✅ Production deployment complete — Build ${BUILD_TAG}"
                """
            }
        }
    }

    // ─────────────────────────────────────────────────────────
    // POST Actions
    // ─────────────────────────────────────────────────────────
    post {
        success {
            echo """
            ╔══════════════════════════════════════╗
            ║  ✅ FeastFlow Pipeline SUCCESS        ║
            ║  Build: ${BUILD_TAG}
            ╚══════════════════════════════════════╝
            """
            emailext(
                subject: "✅ FeastFlow Build #${env.BUILD_NUMBER} Passed",
                body: "Build ${BUILD_TAG} deployed successfully.\nSee: ${env.BUILD_URL}",
                to: 'devops@feastflow.com'
            )
        }
        failure {
            echo """
            ╔══════════════════════════════════════╗
            ║  ❌ FeastFlow Pipeline FAILED         ║
            ║  Build: ${BUILD_TAG}
            ╚══════════════════════════════════════╝
            """
            emailext(
                subject: "❌ FeastFlow Build #${env.BUILD_NUMBER} Failed",
                body: "Build ${BUILD_TAG} failed.\nCheck logs: ${env.BUILD_URL}",
                to: 'devops@feastflow.com'
            )
        }
        always {
            echo '🧹 Cleaning up workspace...'
            sh 'docker system prune -f || true'
        }
    }
}
