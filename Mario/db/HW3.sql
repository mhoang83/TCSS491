-- Jason Langowski
-- Homework 3



-- 1
-- create and use this db if it doesnt exist
CREATE Database if not exists COMPANY;
use COMPANY;

-- drop the tables if they do not exist to load with correct data.
DROP TABLE if exists EMPLOYEE;
DROP TABLE if exists DEPARTMENT;
DROP TABLE if exists DEPT_LOCATIONS;
DROP TABLE if exists WORKS_ON;
DROP TABLE if exists PROJECT;
DROP TABLE if exists DEPENDENT;

-- create tables
CREATE TABLE if not exists EMPLOYEE
(
		Fname varchar(30),
		Minit char,
		Lname varchar(30),
		Ssn int PRIMARY KEY,
		Bdate date,
		Address varchar(250),
		Sex char,
		Salary int,
		Super_ssn int,
		Dno int
);

CREATE TABLE if not exists Department (
	Dname varchar(30),
	Dnumber int primary key,
	Mgr_ssn int,
	Mgr_start_date date
);

CREATE TABLE if not exists DEPT_LOCATIONS
(
	Dnumber int,
	Dlocation varchar(30),
	PRIMARY KEY (Dnumber, Dlocation)
);

CREATE TABLE if not exists WORKS_ON
(
		Essn int,
		Pno int,
		Hours float,
		PRIMARY KEY (Essn, Pno)
);

CREATE TABLE if not exists PROJECT
(
	Pname varchar(30),
	Pnumber int PRIMARY KEY,
	Plocation varchar(30),
	Dnum int
);

CREATE TABLE if not exists DEPENDENT
(
	Essn int,
	Dependent_name varchar(30),
	Sex char,
	Bdate date,
	Relationship varchar(30),
	PRIMARY KEY (Essn, Dependent_name)
);

-- insert values into tables 
INSERT INTO EMPLOYEE VALUES
('John', 'B', 'Smith', 123456789, '1965-01-09','731 Fondren, Houston, TX', 'M', 30000, 333445555, 5),
('Franklin', 'T', 'Wong', 333445555, '1955-12-08','638 Voss, Houston, TX', 'M', 40000, 888665555, 5),
('Alicia', 'J', 'Zelaya', 999887777, '1968-01-19', '3321 Castle, Spring, TX','F', 25000, 987654321, 4),
('Jennifer', 'S', 'Wallace', 987654321, '1941-06-20', '291 Berry, Bellaire, TX','F', 43000, 888665555, 4),
('Ramesh', 'K', 'Narayan', 666884444, '1962-09-15', '975 Fire Oak, Humble, TX','M', 38000, 333445555, 5),
('Joyce', 'A', 'English', 453453453, '1972-07-31', '5631 Rice, Houston, TX','F', 25000, 333445555, 5),
('Ahmad', 'V', 'Jabbar', 987987987, '1969-03-21','980 Dallas, Houston, TX' ,'M', 25000, 987654321, 4),
('James', 'E', 'Borg', 888665555, '1937-11-10', '450 Stone, Houston, TX','M', 55000, null, 1);

INSERT INTO DEPARTMENT VALUES
('Research', 5, 333445555, '1988-05-22'),
('Administration', 4, 987654321, '1995-01-01'),
('Headquarters', 1, 888665555, '1981-06-19');

INSERT INTO DEPT_LOCATIONS VALUES
(1, 'Houston'),
(4, 'Stafford'),
(5, 'Bellaire'),
(5, 'Sugarland'),
(5, 'Houston');

INSERT INTO WORKS_ON VALUES
(123456789, 1, 32.5),
(123456789, 2, 7.5),
(666884444, 3, 40.0),
(453453453, 1, 20),
(453453453, 2, 30.0),
(333445555, 2, 10.0),
(333445555, 3, 10.0),
(333445555, 10, 10.0),
(333445555, 20, 10.0),
(999887777, 30, 30.0),
(999887777, 10, 10.0),
(987987987, 10, 35.0),
(987987987, 30, 5.0),
(987654321, 30, 20.0),
(987654321, 20, 15.0),
(888665555, 20, null);

INSERT INTO PROJECT VALUES
('ProductX', 1, 'Bellaire', 5),
('ProductY', 2, 'Sugarland', 5),
('ProductZ', 3, 'Houston', 5),
('Computerization', 10, 'Stafford', 4),
('Reorganization', 20, 'Houston', 1),
('NewBenifits', 30, 'Stafford', 4);

INSERT INTO DEPENDENT VALUES
(333445555, 'Alice', 'F', '1986-04-05', 'Daughter'),
(333445555, 'Theodore', 'M', '1983-10-25', 'Son'),
(333445555, 'Joy', 'F', '1958-05-03', 'Spouse'),
(987654321, 'Abner', 'M', '1942-02-28', 'Spouse'),
(123456789, 'Michael', 'M', '1988-01-04', 'Son'),
(123456789, 'Alice', 'F', '1988-12-30', 'Daughter'),
(123456789, 'Elizabeth', 'F', '1967-05-05', 'Spouse');

-- 2
-- (a) Retrieve the names of the employees in department 5 
-- who work more than 10 hours per week on the 'ProductX' project

Select Fname, Minit, Lname 
From Employee e
where Ssn in (select Essn
				from WORKS_ON w
				join (Select Pnumber from PROJECT where Pname = 'ProductX') p
				on w.Pno = p.Pnumber
				where Hours > 10.0)
and Dno = 5;

-- (b) List the names of the employees who hac a dependent with the same first names as themselves

Select Fname, Minit, Lname 
from Employee e
join Dependent d 
on e.Ssn = d.Essn
where d.dependent_name = e.Fname;

-- (c) Find the names of employees that are directly supervised by 'Franklin Wong'

Select Fname, Minit, Lname 
from Employee e
where Super_ssn in (Select Ssn from employee where Fname = 'Franklin' and Lname = 'Wong');

-- (d) for each project, list the project name and 
-- the total hours per week (by all employees) spent on that project

Select Pname, sum(Hours) as TotalHours
from Project
join works_on
on Pno = Pnumber
group by Pno;

-- (e) retrieve the names of employees who work on every project

Select Fname, Minit, Lname, project_count 
From Employee e
join (Select Essn, count(Pno) as project_count from Works_on group by Essn) a
on e.Ssn = a.Essn
where project_count = (Select count(*) from project);

-- (f) retirieve the names of the employees who do not work on any projects

Select Fname, Minit, Lname
From Employee e
left join (Select distinct Essn from works_on) a
on e.Ssn = Essn
where e.Ssn = null;

-- (g) for each department, retrieve the department name, and the average salary of the employees working in that department

Select Dname, AvgSalary
from Department
join (Select Dno, avg(Salary) as AvgSalary from Employee group by Dno) a
on Dnumber = Dno;

-- (h) retrieve the average salary of all female employees

Select avg(Salary) as AvgSalary
from Employee
where Sex = 'F'
group by Sex;

-- (i) Find the names and addresses of employees who work on at least one project located in Houston
-- but whose department has no location in Houston

Select e.Fname, e.Minit, e.Lname, e.address
from employee e
join (Select Essn, dnum from works_on join project on pno = pnumber where plocation = 'Houston') a
on a.Essn = e.Ssn
join dept_locations d
on d.dnumber = e.dno
where e.dno not in (Select distinct dnum from works_on join project on pno = pnumber where plocation = 'Houston'); 

-- (j) List the last names of department managers who have no dependents

Select e.Lname
from employee e
join department dt
on dt.mgr_ssn = e.ssn
left join dependent d
on e.Ssn = d.Essn
where dependent_name is null;