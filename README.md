# SplitIt
A mobile application for splitting bills and managing payments among multiple group members. The app allows users to create groups, add shared expenses, and split costs among group members fairly. Each user can add expenses, view their balance, and make payments directly through the app, eliminating confusion about who owes what. The app provides automatic notifications to remind group members of outstanding payments and generates detailed reports on each member’s expenses.

## Used technologies
  - Database: MongoDB
  - Server-side: Python + FastAPI
  - Client-side: JavaScript + React Native

The most important design patterns used are:
- Singleton, for the database instance on the backend
- Custom hooks on front-end (React), to wrap the API calls for each functionality (for example useGroup hook that has `get`, `getAll`, `edit`, `create` functions)
- Subscription mechanism, as described in the interaction diagram below.

## Demo

https://www.youtube.com/shorts/vqFSEFDBiv8

## Project introduction
The SplitIt project was developed to address the increasing need for a user-friendly mobile application to manage shared expenses and debts among groups. The application is designed for individuals who frequently participate in group expenses, such as roommates, friends, colleagues, and family member who want a transparent and organized way to track contributions, outstanding payments, and settled debts.

The main clients for SplitIt are everyday users seeking an efficient tool to handle their expenses without relying on manual calculations. This application aims to simplify the process of recording shared costs, tracking debts, and ensuring accountability, which is often challenging in group settings.

Its overall purpose is to provide a secure, accessible, and intuitive platform where users can manage financial obligations easily. By using SplitIt, users can reduce misunderstandings regarding shared finances, set clear expectations, and avoid the need for constant manual adjustments or reminders. The system’s transparent interface, combined with automatic calculations, promotes fair and effective debt management among users, enhancing collaboration and communication within groups.

Additionally, SplitIt incorporates unique features, such as interactive mini-games and integration with digital payment options, to make expense sharing not only efficient but also engaging and convenient.

## Functional Requirements
The functional requirements of the SplitIt application define its core functionalities and the possible interactions between users and the system. These include:

- User account management:

    - Users will be able to create accounts and log in to access the application,

    - Each user account will include profile information that can be edited later (e.g., name, email address),

    - Users can permanently delete their accounts, including all associated data.

- Group creation and management:

    - Users can create groups to facilitate the management of shared debts among members,

    - Groups will have a unique name and will be managed by the user who created the group,

    - Members can join groups either by direct invitation from the owner or by using an access code provided by the owner,

    - The group owner can edit or delete the group, provided all members have settled their financial obligations.

- Expense management:

    - Users can record expenses within a group, including details like amount, description, and list of purchased items,

    - Expenses can be split equally or assigned manually to each member based on the purchased items,

    - Users can initially add their contributions and those of other members when recording an expense.

- Calculation of balances and debts among members:

    - The system will automatically calculate debts and balances among members based on recorded expenses and payments,

    - Each group member will be able to view the amount they owe to other members and the amount owed to them.

- Notifications and alerts:

    - Users will receive notifications for new expenses recorded, contributions received, or the need to make payments,

    - The group owner can send reminders to members to settle outstanding debts.

- Payment features:

    - Users can confirm payments made between members (e.g., confirming a cash payment),

    - The application will include integration with Revolut accounts to facilitate direct transfers.

- Mini-games for expense splitting:

    - To add an interactive element, users can use mini-game features (e.g., "Spin-the-Wheel" or "Rock-Paper-Scissors") to decide the payment proportion randomly.

- Recurring expense management:

    - Users can schedule recurring expenses (e.g., monthly bills) and set automatic notifications for them,

    - The system will automatically add recurring expenses to the selected group on the predefined dates.
 
## Diagrams

### Use case diagram (group diagram)

![image](https://github.com/user-attachments/assets/61eda9c2-6487-4182-8b12-feb514b31c85)

### Gantt diagram (group diagram)

This diagram presents the contribution of each team member. For all the big stories present in this diagram, there was at least one front-end task (did by Vlad) and at least one back-end task (did by the assigned member, which thought about how we can change the application's architecture to fit the desired needs of the task). For more complex flows, we decided on the approach together. Not all the tasks were done, as we planned our work for one extra sprint period.

![image](https://github.com/user-attachments/assets/f6ba40f6-ffc3-4d78-874a-13eeb10ce03d)

### Class diagram (Bogdan)

![image](https://github.com/user-attachments/assets/4225ced1-287c-435f-a0bb-0f2882a134ee)

### Authentication diagram (Bogdan)

![image](https://github.com/user-attachments/assets/ad884ee9-fab0-44bc-b3f7-a46714710798)

### Front-end workflow diagram (Vlad)

![image](https://github.com/user-attachments/assets/80db30c7-543b-4044-a5da-f24f38dc0677)

### Subscription mechanism and front-end component interaction diagram (Vlad)

![image](https://github.com/user-attachments/assets/def6df0a-dbb9-4b7f-b8a1-e6ae6258362a)

### Get group backend flow diagram (Octavian)

![image](https://github.com/user-attachments/assets/e1312dd8-780f-40a2-b404-afd91b0a853e)

### Join group swimlane diagram (Octavian)

![image](https://github.com/user-attachments/assets/117c9c33-8b90-4179-bf98-9beaf8580368)
