pipeline {
    agent any

    environment {
        JWT_SECRET    = credentials('BHASHAFLOW_JWT_SECRET')
        SARVAM_API_KEY = credentials('BHASHAFLOW_SARVAM_KEY')
        MONGO_URI     = credentials('BHASHAFLOW_MONGO_URI')
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }
        stage('Build Docker Images') {
            steps {
                sh 'docker-compose build'
            }
        }
        stage('Test & Run') {
            steps {
                // Write .env from Jenkins credentials — NO secrets in code!
                sh '''
                echo "MONGO_URI=${MONGO_URI}" > .env
                echo "JWT_SECRET=${JWT_SECRET}" >> .env
                echo "PORT=5000" >> .env
                '''
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