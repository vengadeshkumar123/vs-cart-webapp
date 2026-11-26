
pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-south-1'
        ECR_REGISTRY = '113056210430.dkr.ecr.ap-south-1.amazonaws.com'

        FRONTEND_REPO = 'vscart-frontend'
        BACKEND_REPO = 'vscart-backend'

        EC2_HOST = '10.0.27.118'
        EC2_USER = 'ubuntu'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm

                script {
                    env.IMAGE_TAG = "${env.BUILD_NUMBER}"
                    env.FRONTEND_URI = "${ECR_REGISTRY}/${FRONTEND_REPO}"
                    env.BACKEND_URI = "${ECR_REGISTRY}/${BACKEND_REPO}"
                }
            }
        }

        stage('Build Images') {
            steps {
                sh '''
                    docker build -f client/Dockerfile \
                        -t ${FRONTEND_URI}:${IMAGE_TAG} .

                    docker build -f server/Dockerfile \
                        -t ${BACKEND_URI}:${IMAGE_TAG} .
                '''
            }
        }

        stage('Push Images to ECR') {
            steps {
                sh '''
                    aws ecr get-login-password --region ${AWS_REGION} |
                    docker login --username AWS --password-stdin ${ECR_REGISTRY}

                    docker push ${FRONTEND_URI}:${IMAGE_TAG}
                    docker push ${BACKEND_URI}:${IMAGE_TAG}
                '''
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent(credentials: ['ec2-ssh-key']) {
                    sh '''
                        scp deploy/deploy.sh ${EC2_USER}@${EC2_HOST}:/tmp/deploy.sh

                        ssh ${EC2_USER}@${EC2_HOST} \
                        "bash /tmp/deploy.sh ${FRONTEND_URI}:${IMAGE_TAG} ${BACKEND_URI}:${IMAGE_TAG} ${AWS_REGION}"
                    '''
                }
            }
        }
    }
}
