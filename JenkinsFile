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
                sh 'docker-compose build'
            }
        }
        stage('Test & Run') {
            steps {
                // In the future, you will add testing scripts here
                sh 'docker-compose up -d'
            }
        }
    }
}