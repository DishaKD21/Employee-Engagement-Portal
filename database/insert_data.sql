-- =========================
-- 1. EMPLOYEES
-- =========================
INSERT INTO employees (name, email, date_of_birth, joining_date, department, role)
VALUES
('Ravi', 'ravi@test.com', '1998-04-24', '2021-04-24', 'HR', 'Employee'),
('Priya', 'priya@test.com', '1997-06-12', '2022-01-10', 'IT', 'Manager'),
('Amit', 'amit@test.com', '1996-08-15', '2020-03-05', 'Finance', 'Analyst'),
('Neha', 'neha@test.com', '1999-11-20', '2023-07-01', 'HR', 'Executive'),
('Rahul', 'rahul@test.com', '1995-02-18', '2019-09-15', 'IT', 'Lead'),
('Kiran','kiran@test.com','1994-03-10','2018-06-01','HR','Manager'),
('Sneha','sneha@test.com','1998-07-21','2021-11-12','IT','Developer'),
('Arjun','arjun@test.com','1993-12-02','2017-05-19','Finance','Analyst'),
('Pooja','pooja@test.com','1997-09-18','2020-08-25','HR','Executive'),
('Vikas','vikas@test.com','1992-01-14','2016-04-11','IT','Lead'),
('Anjali','anjali@test.com','1999-06-30','2023-02-10','Finance','Intern'),
('Rohit','rohit@test.com','1995-10-05','2019-12-20','IT','Engineer'),
('Simran','simran@test.com','1996-04-11','2020-03-22','HR','Coordinator'),
('Deepak','deepak@test.com','1991-08-28','2015-07-15','Finance','Manager'),
('Meera','meera@test.com','1998-02-17','2022-06-01','IT','Analyst'),
('Nikhil','nikhil@test.com','1994-11-09','2018-09-30','IT','Developer'),
('Aisha','aisha@test.com','1997-05-26','2021-01-18','HR','Executive'),
('Varun','varun@test.com','1993-03-03','2017-10-10','Finance','Lead'),
('Tanya','tanya@test.com','1999-12-12','2023-04-05','IT','Intern'),
('Gaurav','gaurav@test.com','1990-07-07','2014-03-03','HR','Manager');
-- =========================
-- 2. RECOGNITION TEMPLATES
-- =========================
INSERT INTO recognition_templates (template_name, event_type, content, version, created_by, approved_status)
VALUES
('Birthday Template 1', 'birthday', 'Happy Birthday {{name}}!', 1, 1, 'approved'),
('Anniversary Template 1', 'anniversary', 'Congrats {{name}} on your anniversary!', 1, 1, 'approved'),
('Birthday Template 2', 'birthday', 'Enjoy your special day {{name}}!', 2, 2, 'approved'),
('Anniversary Template 2', 'anniversary', 'Cheers to your journey {{name}}!', 2, 2, 'approved'),
('Generic Template', 'other', 'Best wishes {{name}}!', 1, 3, 'approved'),
('Template 6','birthday','Enjoy {{name}}!',1,1,'approved'),
('Template 7','anniversary','Congrats {{name}}!',1,2,'approved'),
('Template 8','birthday','Happy day {{name}}!',2,3,'approved'),
('Template 9','anniversary','Cheers {{name}}!',2,4,'approved'),
('Template 10','other','Best wishes {{name}}!',1,5,'approved'),
('Template 11','birthday','Celebrate {{name}}!',1,1,'approved'),
('Template 12','anniversary','Milestone {{name}}!',1,2,'approved'),
('Template 13','birthday','Joy {{name}}!',2,3,'approved'),
('Template 14','anniversary','Congrats again {{name}}!',2,4,'approved'),
('Template 15','other','Stay awesome {{name}}!',1,5,'approved'),
('Template 16','birthday','Have fun {{name}}!',1,1,'approved'),
('Template 17','anniversary','Proud of you {{name}}!',1,2,'approved'),
('Template 18','birthday','Party time {{name}}!',2,3,'approved'),
('Template 19','anniversary','Success {{name}}!',2,4,'approved'),
('Template 20','other','Keep shining {{name}}!',1,5,'approved');
-- =========================
-- 3. RECOGNITION EVENTS
-- =========================
INSERT INTO recognition_events (employee_id, event_type, trigger_date, template_id, delivery_status)
VALUES
(1, 'birthday', CURRENT_DATE, 1, 'success'),
(2, 'anniversary', CURRENT_DATE, 2, 'success'),
(3, 'birthday', CURRENT_DATE, 3, 'pending'),
(4, 'anniversary', CURRENT_DATE, 4, 'success'),
(5, 'other', CURRENT_DATE, 5, 'failed'),
(6,'birthday',CURRENT_DATE,6,'success'),
(7,'anniversary',CURRENT_DATE,7,'success'),
(8,'birthday',CURRENT_DATE,8,'pending'),
(9,'anniversary',CURRENT_DATE,9,'success'),
(10,'other',CURRENT_DATE,10,'failed'),
(11,'birthday',CURRENT_DATE,11,'success'),
(12,'anniversary',CURRENT_DATE,12,'success'),
(13,'birthday',CURRENT_DATE,13,'pending'),
(14,'anniversary',CURRENT_DATE,14,'success'),
(15,'other',CURRENT_DATE,15,'success'),
(16,'birthday',CURRENT_DATE,16,'success'),
(17,'anniversary',CURRENT_DATE,17,'success'),
(18,'birthday',CURRENT_DATE,18,'pending'),
(19,'anniversary',CURRENT_DATE,19,'success'),
(20,'other',CURRENT_DATE,20,'failed');

-- =========================
-- 4. RECOGNITION DELIVERY LOGS
-- =========================
INSERT INTO recognition_delivery_logs (event_id, channel, delivery_status, retry_count, delivered_at)
VALUES
(1, 'email', 'success', 0, NOW()),
(2, 'chat', 'success', 0, NOW()),
(3, 'email', 'pending', 1, NULL),
(4, 'intranet', 'success', 0, NOW()),
(5, 'email', 'failed', 2, NULL),
(6,'email','success',0,NOW()),
(7,'chat','success',0,NOW()),
(8,'email','pending',1,NULL),
(9,'intranet','success',0,NOW()),
(10,'email','failed',2,NULL),
(11,'chat','success',0,NOW()),
(12,'email','success',0,NOW()),
(13,'email','pending',1,NULL),
(14,'chat','success',0,NOW()),
(15,'intranet','success',0,NOW()),
(16,'email','success',0,NOW()),
(17,'chat','success',0,NOW()),
(18,'email','pending',1,NULL),
(19,'intranet','success',0,NOW()),
(20,'email','failed',2,NULL);

-- =========================
-- 5. ENGAGEMENT EVENTS
-- =========================
INSERT INTO engagement_events (event_name, event_type, description, target_audience, registration_start, registration_end, event_date, published_date, status, created_by, approved_status)
VALUES
('Quiz', 'Fun', 'General quiz event', 'All', CURRENT_DATE, CURRENT_DATE + 2, CURRENT_DATE + 3, CURRENT_DATE, 'published', 1, 'approved'),
('Hackathon', 'Tech', 'Coding event', 'IT', CURRENT_DATE, CURRENT_DATE + 5, CURRENT_DATE + 7, CURRENT_DATE, 'published', 2, 'approved'),
('Workshop', 'Learning', 'Skill training', 'HR', CURRENT_DATE, CURRENT_DATE + 3, CURRENT_DATE + 5, CURRENT_DATE, 'draft', 3, 'pending'),
('Seminar', 'Knowledge', 'Guest lecture', 'All', CURRENT_DATE, CURRENT_DATE + 2, CURRENT_DATE + 4, CURRENT_DATE, 'completed', 1, 'approved'),
('Sports Day', 'Fun', 'Outdoor games', 'All', CURRENT_DATE, CURRENT_DATE + 4, CURRENT_DATE + 6, CURRENT_DATE, 'published', 2, 'approved'),
('Event6','Fun','Desc','All',CURRENT_DATE,CURRENT_DATE+2,CURRENT_DATE+3,CURRENT_DATE,'published',1,'approved'),
('Event7','Tech','Desc','IT',CURRENT_DATE,CURRENT_DATE+3,CURRENT_DATE+4,CURRENT_DATE,'published',2,'approved'),
('Event8','HR','Desc','HR',CURRENT_DATE,CURRENT_DATE+4,CURRENT_DATE+5,CURRENT_DATE,'draft',3,'pending'),
('Event9','Fun','Desc','All',CURRENT_DATE,CURRENT_DATE+2,CURRENT_DATE+4,CURRENT_DATE,'completed',1,'approved'),
('Event10','Sports','Desc','All',CURRENT_DATE,CURRENT_DATE+3,CURRENT_DATE+5,CURRENT_DATE,'published',2,'approved'),
('Event11','Fun','Desc','All',CURRENT_DATE,CURRENT_DATE+2,CURRENT_DATE+3,CURRENT_DATE,'published',1,'approved'),
('Event12','Tech','Desc','IT',CURRENT_DATE,CURRENT_DATE+3,CURRENT_DATE+4,CURRENT_DATE,'published',2,'approved'),
('Event13','HR','Desc','HR',CURRENT_DATE,CURRENT_DATE+4,CURRENT_DATE+5,CURRENT_DATE,'draft',3,'pending'),
('Event14','Fun','Desc','All',CURRENT_DATE,CURRENT_DATE+2,CURRENT_DATE+4,CURRENT_DATE,'completed',1,'approved'),
('Event15','Sports','Desc','All',CURRENT_DATE,CURRENT_DATE+3,CURRENT_DATE+5,CURRENT_DATE,'published',2,'approved'),
('Event16','Fun','Desc','All',CURRENT_DATE,CURRENT_DATE+2,CURRENT_DATE+3,CURRENT_DATE,'published',1,'approved'),
('Event17','Tech','Desc','IT',CURRENT_DATE,CURRENT_DATE+3,CURRENT_DATE+4,CURRENT_DATE,'published',2,'approved'),
('Event18','HR','Desc','HR',CURRENT_DATE,CURRENT_DATE+4,CURRENT_DATE+5,CURRENT_DATE,'draft',3,'pending'),
('Event19','Fun','Desc','All',CURRENT_DATE,CURRENT_DATE+2,CURRENT_DATE+4,CURRENT_DATE,'completed',1,'approved'),
('Event20','Sports','Desc','All',CURRENT_DATE,CURRENT_DATE+3,CURRENT_DATE+5,CURRENT_DATE,'published',2,'approved');

-- =========================
-- 6. EVENT PARTICIPANTS
-- =========================
INSERT INTO event_participants (event_id, employee_id, registration_status, participation_status, feedback_rating, feedback_text)
VALUES
(1,1,true,'participated',4.5,'Good'),
(1,2,true,'participated',4.0,'Nice'),
(2,3,true,'registered',NULL,NULL),
(3,4,false,'absent',NULL,NULL),
(4,5,true,'participated',5.0,'Excellent'),
(6,6,true,'participated',4.2,'Good'),
(7,7,true,'participated',4.0,'Nice'),
(8,8,true,'registered',NULL,NULL),
(9,9,false,'absent',NULL,NULL),
(10,10,true,'participated',5.0,'Excellent'),
(11,11,true,'participated',4.1,'Good'),
(12,12,true,'participated',3.9,'Okay'),
(13,13,false,'absent',NULL,NULL),
(14,14,true,'participated',4.7,'Great'),
(15,15,true,'participated',4.8,'Awesome'),
(16,16,true,'registered',NULL,NULL),
(17,17,true,'participated',4.3,'Nice'),
(18,18,false,'absent',NULL,NULL),
(19,19,true,'participated',4.6,'Great'),
(20,20,true,'participated',5.0,'Perfect');

-- =========================
-- 7. SURVEYS
-- =========================
INSERT INTO surveys (title, target_audience, open_date, close_date, created_by, approved_status)
VALUES
('Feedback Survey','All',CURRENT_DATE,CURRENT_DATE+5,1,'approved'),
('HR Survey','HR',CURRENT_DATE,CURRENT_DATE+3,2,'approved'),
('IT Survey','IT',CURRENT_DATE,CURRENT_DATE+4,3,'pending'),
('Training Survey','All',CURRENT_DATE,CURRENT_DATE+2,1,'approved'),
('Event Survey','All',CURRENT_DATE,CURRENT_DATE+6,2,'approved'),
('Survey6','All',CURRENT_DATE,CURRENT_DATE+5,1,'approved'),
('Survey7','All',CURRENT_DATE,CURRENT_DATE+5,1,'approved'),
('Survey8','All',CURRENT_DATE,CURRENT_DATE+5,1,'approved'),
('Survey9','All',CURRENT_DATE,CURRENT_DATE+5,1,'approved'),
('Survey10','All',CURRENT_DATE,CURRENT_DATE+5,1,'approved'),
('Survey11','All',CURRENT_DATE,CURRENT_DATE+5,1,'approved'),
('Survey12','All',CURRENT_DATE,CURRENT_DATE+5,1,'approved'),
('Survey13','All',CURRENT_DATE,CURRENT_DATE+5,1,'approved'),
('Survey14','All',CURRENT_DATE,CURRENT_DATE+5,1,'approved'),
('Survey15','All',CURRENT_DATE,CURRENT_DATE+5,1,'approved'),
('Survey16','All',CURRENT_DATE,CURRENT_DATE+5,1,'approved'),
('Survey17','All',CURRENT_DATE,CURRENT_DATE+5,1,'approved'),
('Survey18','All',CURRENT_DATE,CURRENT_DATE+5,1,'approved'),
('Survey19','All',CURRENT_DATE,CURRENT_DATE+5,1,'approved');


-- =========================
-- 8. SURVEY QUESTIONS
-- =========================
INSERT INTO survey_questions (survey_id, question_text, question_type)
VALUES
(1,'Rate experience','rating'),
(2,'HR satisfaction','rating'),
(3,'IT tools feedback','text'),
(4,'Training quality','rating'),
(5,'Event feedback','text'),
(6,'Rate HR','rating'),
(7,'Tools usage','text'),
(8,'Training satisfaction','rating'),
(9,'Office environment','text'),
(10,'Leadership rating','rating'),
(11,'Work culture','text'),
(12,'Benefits','rating'),
(13,'Growth','text'),
(14,'Learning','rating'),
(15,'Support','text'),
(16,'Work-life balance','rating'),
(17,'Flexibility','text'),
(18,'Policies','rating'),
(19,'Suggestions','text');

-- =========================
-- 9. SURVEY RESPONSES
-- =========================
INSERT INTO survey_responses (survey_id, employee_id)
VALUES
(1,1),(1,2),(2,3),(3,4),(4,5),
(5,6),(6,7),(7,8),(8,9),(9,10),
(10,11),(11,12),(12,13),(13,14),(14,15),
(15,16),(16,17),(17,18),(18,19),(19,20);

-- =========================
-- 10. SURVEY ANSWERS
-- =========================
INSERT INTO survey_answers (response_id, question_id, answer_text)
VALUES
(1,1,'5'),
(2,2,'Good'),
(3,3,'4'),
(4,4,'Improve tools'),
(5,5,'5'),
(6,6,'4'),
(7,7,'Good'),
(8,8,'Improve'),
(9,9,'5'),
(10,10,'Nice'),
(11,11,'4'),
(12,12,'Okay'),
(13,13,'Better'),
(14,14,'5'),
(15,15,'Excellent'),
(16,16,'4'),
(17,17,'Nice'),
(18,18,'Improve'),
(19,19,'5'),
(20,20,'Great');

-- =========================
-- 11. KNOWLEDGE BASE ARTICLES
-- =========================
INSERT INTO knowledge_base_articles (title, content, category, role_tag, author, version, status)
VALUES
('Leave Policy','20 days leave','HR','All',1,1,'published'),
('IT Policy','Use secure tools','IT','All',2,1,'published'),
('Finance Rules','Budget guidelines','Finance','All',3,1,'draft'),
('Work Policy','Remote work allowed','HR','All',1,2,'published'),
('Security Policy','Password rules','IT','All',2,2,'approved'),
('Policy6','Content','HR','All',1,1,'published'),
('Policy7','Content','IT','All',2,1,'published'),
('Policy8','Content','Finance','All',3,1,'draft'),
('Policy9','Content','HR','All',1,2,'published'),
('Policy10','Content','IT','All',2,2,'approved'),
('Policy11','Content','HR','All',1,1,'published'),
('Policy12','Content','IT','All',2,1,'published'),
('Policy13','Content','Finance','All',3,1,'draft'),
('Policy14','Content','HR','All',1,2,'published'),
('Policy15','Content','IT','All',2,2,'approved'),
('Policy16','Content','HR','All',1,1,'published'),
('Policy17','Content','IT','All',2,1,'published'),
('Policy18','Content','Finance','All',3,1,'draft'),
('Policy19','Content','HR','All',1,2,'published'),
('Policy20','Content','IT','All',2,2,'approved');

-- =========================
-- 12. QUERY LOGS
-- =========================
INSERT INTO query_logs (employee_id, query_text, matched_article_id, confidence_score, response_delivered)
VALUES
(1,'leave policy',1,0.9,'Shown'),
(2,'IT rules',2,0.8,'Shown'),
(3,'budget',3,0.7,'Shown'),
(4,'work policy',4,0.95,'Shown'),
(5,'security',5,0.85,'Shown'),
(6,'policy',6,0.8,'Shown'),
(7,'rules',7,0.85,'Shown'),
(8,'finance',8,0.7,'Shown'),
(9,'leave',9,0.9,'Shown'),
(10,'security',10,0.88,'Shown'),
(11,'policy',11,0.8,'Shown'),
(12,'rules',12,0.85,'Shown'),
(13,'finance',13,0.7,'Shown'),
(14,'leave',14,0.9,'Shown'),
(15,'security',15,0.88,'Shown'),
(16,'policy',16,0.8,'Shown'),
(17,'rules',17,0.85,'Shown'),
(18,'finance',18,0.7,'Shown'),
(19,'leave',19,0.9,'Shown'),
(20,'security',20,0.88,'Shown');

-- =========================
-- 13. QUERY ESCALATIONS
-- =========================
INSERT INTO query_escalations (query_id, assigned_to, status, resolution_text)
VALUES
(1,2,'resolved','Answered'),
(2,3,'open',NULL),
(3,1,'resolved','Handled'),
(4,2,'open',NULL),
(5,3,'resolved','Closed'),
(6,2,'resolved','Done'),
(7,3,'open',NULL),
(8,1,'resolved','Handled'),
(9,2,'open',NULL),
(10,3,'resolved','Closed'),
(11,2,'resolved','Done'),
(12,3,'open',NULL),
(13,1,'resolved','Handled'),
(14,2,'open',NULL),
(15,3,'resolved','Closed'),
(16,2,'resolved','Done'),
(17,3,'open',NULL),
(18,1,'resolved','Handled'),
(19,2,'open',NULL),
(20,3,'resolved','Closed');

-- =========================
-- 14. APPROVALS
-- =========================
INSERT INTO approvals (content_type, content_id, status, reviewer_id, comments)
VALUES
('event',1,'approved',1,'OK'),
('survey',1,'approved',2,'Good'),
('article',1,'approved',3,'Fine'),
('template',1,'pending',2,NULL),
('event',2,'approved',1,'Approved'),
('event',6,'approved',1,'OK'),
('survey',6,'approved',2,'Good'),
('article',6,'approved',3,'Fine'),
('template',6,'pending',2,NULL),
('event',7,'approved',1,'OK'),
('survey',7,'approved',2,'Good'),
('article',7,'approved',3,'Fine'),
('template',7,'pending',2,NULL),
('event',8,'approved',1,'OK'),
('survey',8,'approved',2,'Good'),
('article',8,'approved',3,'Fine'),
('template',8,'pending',2,NULL),
('event',9,'approved',1,'OK'),
('survey',9,'approved',2,'Good'),
('article',9,'approved',3,'Fine');

-- =========================
-- 15. AUDIT LOGS
-- =========================
INSERT INTO audit_logs (event_type, employee_id, content_id, channel, outcome, reviewer_decision)
VALUES
('recognition',1,1,'email','delivered','approved'),
('event',2,1,'portal','participated','approved'),
('query',3,3,'chat','resolved','approved'),
('survey',4,2,'portal','submitted','approved'),
('system',5,1,'system','success','approved'),
('recognition',6,6,'email','delivered','approved'),
('event',7,7,'portal','participated','approved'),
('query',8,8,'chat','resolved','approved'),
('survey',9,9,'portal','submitted','approved'),
('system',10,10,'system','success','approved'),
('recognition',11,11,'email','delivered','approved'),
('event',12,12,'portal','participated','approved'),
('query',13,13,'chat','resolved','approved'),
('survey',14,14,'portal','submitted','approved'),
('system',15,15,'system','success','approved'),
('recognition',16,16,'email','delivered','approved'),
('event',17,17,'portal','participated','approved'),
('query',18,18,'chat','resolved','approved'),
('survey',19,19,'portal','submitted','approved'),
('system',20,20,'system','success','approved');

-- =========================
-- 16. NOTIFICATIONS
-- =========================
INSERT INTO notifications (employee_id, title, message, notification_type, related_id, related_type, channel, status)
VALUES
(1,'Birthday','Happy Birthday','recognition',1,'event','email','sent'),
(2,'Event','Join quiz','event',1,'event','chat','sent'),
(3,'Survey','Fill survey','survey',1,'survey','email','pending'),
(4,'Query','Answer ready','query_response',1,'query','chat','sent'),
(5,'System','Update','system',NULL,'system','intranet','sent'),
(6,'Msg','Hello','event',6,'event','email','sent'),
(7,'Msg','Hello','event',7,'event','chat','sent'),
(8,'Msg','Hello','survey',8,'survey','email','pending'),
(9,'Msg','Hello','query_response',9,'query','chat','sent'),
(10,'Msg','Hello','system',10,'system','intranet','sent'),
(11,'Msg','Hello','event',11,'event','email','sent'),
(12,'Msg','Hello','event',12,'event','chat','sent'),
(13,'Msg','Hello','survey',13,'survey','email','pending'),
(14,'Msg','Hello','query_response',14,'query','chat','sent'),
(15,'Msg','Hello','system',15,'system','intranet','sent'),
(16,'Msg','Hello','event',16,'event','email','sent'),
(17,'Msg','Hello','event',17,'event','chat','sent'),
(18,'Msg','Hello','survey',18,'survey','email','pending'),
(19,'Msg','Hello','query_response',19,'query','chat','sent'),
(20,'Msg','Hello','system',20,'system','intranet','sent');