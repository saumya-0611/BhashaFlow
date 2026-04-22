pipeline {
    agent any

    environment {
        JWT_SECRET           = credentials('BHASHAFLOW_JWT_SECRET')
        SARVAM_API_KEY       = credentials('BHASHAFLOW_SARVAM_KEY')
        MONGO_URI            = credentials('BHASHAFLOW_MONGO_URI')
        GEMINI_API_KEY       = credentials('BHASHAFLOW_GEMINI_KEY')
        GOOGLE_CLIENT_ID     = credentials('BHASHAFLOW_GOOGLE_CLIENT_ID')
        GOOGLE_CLIENT_SECRET = credentials('BHASHAFLOW_GOOGLE_CLIENT_SECRET')
        GMAIL_USER           = credentials('BHASHAFLOW_GMAIL_USER')
        GMAIL_PASS           = credentials('BHASHAFLOW_GMAIL_PASS')
        TECH_LEAD_EMAIL      = credentials('BHASHAFLOW_TECH_LEAD_EMAIL')
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }
        
        stage('Prepare Environment') {
            steps {
                sh '''
                echo "MONGO_URI=${MONGO_URI}"                               > .env
                echo "JWT_SECRET=${JWT_SECRET}"                            >> .env
                echo "PORT=5000"                                           >> .env
                echo "SARVAM_API_KEY=${SARVAM_API_KEY}"                    >> .env
                echo "GEMINI_API_KEY=${GEMINI_API_KEY}"                    >> .env
                echo "GMAIL_USER=${GMAIL_USER}"                            >> .env
                echo "GMAIL_PASS=${GMAIL_PASS}"                            >> .env
                echo "GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}"                >> .env
                echo "VITE_GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}"           >> .env
                echo "GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}"        >> .env
                echo "TECH_LEAD_EMAIL=${TECH_LEAD_EMAIL}"                  >> .env
                echo "FRONTEND_URL=http://localhost:3000"                  >> .env
                echo "VITE_BACKEND_URL=http://localhost:5000"              >> .env
                '''
            }
        }
        
        stage('Build Docker Images') {
            steps {
                sh 'docker-compose build'
            }
        }
        
        stage('Test & Run') {
            steps {
                sh 'docker-compose up -d'
            }
        }
    }

    post {
        failure {
            emailext to: "${env.TECH_LEAD_EMAIL}",
                subject: "🚨 BhashaFlow Build Failed: ${env.JOB_NAME} [${env.BUILD_NUMBER}]",
                body: "Build #${env.BUILD_NUMBER} failed. Check: ${env.BUILD_URL}"
        }
        success { echo 'Build passed!' }
    }
}