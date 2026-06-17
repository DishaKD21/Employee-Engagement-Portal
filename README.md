# Enterprise Employee Engagement Platform

**Live Application:** http://13.127.241.234:3000/

## Overview

The Enterprise Employee Engagement Platform is a role-based application designed for employee engagement, HR operations, and  knowledge base query management. It provides dedicated workspaces for Employees, HR Teams, HR Managers, Compliance Reviewers, and Super Administrator, enabling them to manage policies, employee queries, surveys, events, recognition programs, and approval workflows from a centralized system.

The platform includes an AI-powered HR Assistant built using Retrieval-Augmented Generation (RAG), allowing employees to receive instant answers from approved organizational knowledge. Queries that cannot be answered with sufficient confidence are automatically escalated to HR for review and resolution, creating a continuous knowledge improvement cycle.

## Core Features

* AI-Powered HR Knowledge Assistant
* Knowledge Base Management
* Query Escalation and Resolution Workflow
* Event Management
* Survey Management
* Employee Recognition Programs
* Role-Based Access Control (RBAC)
* Policy Approval Workflows
* Automated Email Notifications
* Audit and Activity Tracking

## User Roles

* **Employee** – Access the AI assistant, participate in events and surveys, and track queries.
* **HR** – Manage policies, knowledge base content, events, surveys
* **HR Manager** – Review approvals and monitor escalations.
* **Compliance Reviewer** – Review activities requiring compliance oversight.
* **Super Admin** – Manage users, credentials, and platform access.

## Technology Stack

**Frontend**

* Next.js
* React
* TypeScript
* Mantine UI
* Zustand

**Backend**

* Node.js
* Express.js
* TypeScript

**Database**

* PostgreSQL
* Prisma ORM

**AI Service**

* FastAPI
* Sentence Transformers
* pgvector
* Ollama

**Infrastructure**

* AWS EC2
* Docker
