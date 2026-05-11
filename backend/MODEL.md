### VolunteerConnect is an app that allows Organisation to create Opportunity (volunteer event are called Opportunity), Volunteer to apply and join an Opportunity.
---
## Users Role in VolunteerConnect
The 3 roles of VolunteerConnect users are:
1. Volunteer
- sign up
- wait for admin to apporve their account creation
- after approved by admin, only can they succesfully login into thier account 
- at the sign up process, they are required to provide their name, email, password, resume, age-group
- after login to their profile, they cannot modify their email anymore, but is allowed to update their resume, avatar, biodata
- can follow Organisation profile they are interested in 
- can browse Opportunity 

2. Organisation 
- sign up
- wait for admin to apporve their account creation
- after approved by admin, only can they succesfully login into thier account 
- at the sign up process, they are required to provide their org name, email, password, description
- after login to their profile, they cannot modify their email anymore, but is allowed to update their description, avatar
- can be followed by Volunteer

3. Admin
- default account for VolunteerConnect admins 
- role is to view who are the acccount creator, either approve or reject their account creation
- have access to all users credential

--- 
## Models of VolunteerConnect
1. Application
- after Volunteer apply to join an Opportunity (created by an Organisation), they will need to wait for their application to be approved by the respective Organisation before they are eligible to join the Opportunity

2. Opportunity 
- created by Organisation 
- has a title, description, location, time

