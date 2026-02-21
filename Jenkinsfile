pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Build Docker Images') {
            steps {
                sh 'docker-compose buildddd'
            }
        }
        stage('Test & Run') {
            steps {
                // In the future, you will add testing scripts here
                sh 'docker-compose up -d'
            }
        }
    }
    
    post {
        failure {
            echo 'Build failed! Sending email alert...'
            emailext to: "${env.TECH_LEAD_EMAIL}",
                 subject: "🚨 BhashaFlow Build Failed: ${env.JOB_NAME} [${env.BUILD_NUMBER}]",
                 body: """
                 Team! The latest push broke the BhashaFlow pipeline.
                 
                 Job: ${env.JOB_NAME}
                 Build Number: ${env.BUILD_NUMBER}
                 Check the console output here: ${env.BUILD_URL}
                 
                 Please fix it immediately.
                 - Saumya (Tech Lead Bot)
                 """
        }
        success {
            echo 'Build passed!'
        }
    }
}