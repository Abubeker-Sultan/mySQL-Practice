const mysql = require('mysql2/promise');

async function main() {
    const connection = await mysql.createConnection({ host: 'localhost', user: 'Abuki', password: '123456',database: "library" });

    await connection.query('CREATE DATABASE IF NOT EXISTS library');
    await connection.end();

    const db = await mysql.createConnection({ host: 'localhost', user: 'Abuki', password: '123456',database: "library" });

 
    await db.query(`
        CREATE TABLE IF NOT EXISTS books (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255),
            author VARCHAR(255)
        )
    `);

    const [columns] = await db.query("SHOW COLUMNS FROM books LIKE 'published_year'");
    if (columns.length === 0) {
        await db.query('ALTER TABLE books ADD COLUMN published_year INT');
    }

  
    await db.query(`
        CREATE TABLE IF NOT EXISTS members (
            member_id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            email VARCHAR(255)
        )
    `);


    await db.query(`
        CREATE TABLE IF NOT EXISTS borrowings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            book_id INT,
            member_id INT,
            borrow_date DATE,
            FOREIGN KEY (book_id) REFERENCES books(id),
            FOREIGN KEY (member_id) REFERENCES members(member_id)
        )
    `);

 
    await db.query(`
        CREATE TABLE IF NOT EXISTS products (
            id INT PRIMARY KEY,
            name VARCHAR(255),
            price DECIMAL(10, 2)
        )
    `);

  
    await db.query(`
        INSERT INTO products (id, name, price)
        VALUES 
            (1, 'Product A', 45.00),
            (2, 'Product B', 75.00),
            (3, 'Product C', 120.00),
            (4, 'Product D', 55.50),
            (5, 'Product E', 30.00)
        ON DUPLICATE KEY UPDATE price = VALUES(price)
    `);

 
    await db.query(`
        CREATE TABLE IF NOT EXISTS departments (
            department_id INT PRIMARY KEY,
            department_name VARCHAR(255)
        )
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS employees (
            employee_id INT AUTO_INCREMENT PRIMARY KEY,
            first_name VARCHAR(255),
            last_name VARCHAR(255),
            salary DECIMAL(10,2),
            job_title VARCHAR(255),
            department_id INT,
            hire_date DATE,
            FOREIGN KEY (department_id) REFERENCES departments(department_id)
        )
    `);

 
    await db.query(`
        INSERT IGNORE INTO departments (department_id, department_name)
        VALUES (1, 'HR'), (2, 'IT'), (3, 'Sales')
    `);


    await db.query(`
        INSERT INTO employees (first_name, last_name, salary, job_title, department_id, hire_date)
        VALUES 
            ('Ahmed', 'Esmael', 60000, 'Developer', 2, '2024-03-01'),
            ('Hikma', 'Adem', 75000, 'Sales Manager', 3, '2023-06-15'),
            ('Ibstisam', 'Amir', 82000, 'HR Officer', 1, '2025-01-10')
    `);


    const [expensiveProducts] = await db.query(`
        SELECT name, price FROM products WHERE price > 50
    `);
    console.log('Products with price > 50:', expensiveProducts);


    const [recentEmployees] = await db.query(`
        SELECT first_name, last_name FROM employees WHERE hire_date > '2023-01-01'
    `);
    console.log('Employees hired after Jan 1, 2023:', recentEmployees);


    const [deptCounts] = await db.query(`
        SELECT d.department_name, COUNT(e.employee_id) AS employee_count
        FROM departments d
        LEFT JOIN employees e ON d.department_id = e.department_id
        GROUP BY d.department_id
    `);
    console.log('Employee count per department:', deptCounts);


    await db.query(`
        UPDATE employees SET salary = 85000 WHERE employee_id = 1
    `);

 
    await db.query(`
        DELETE FROM products WHERE id = 2
    `);


    const [employeeDetails] = await db.query(`
        SELECT CONCAT(first_name, ' ', last_name) AS full_name, salary, job_title
        FROM employees
    `);
    console.log('Employee details:', employeeDetails);

 
    const [employeesWithDepts] = await db.query(`
        SELECT e.first_name, e.last_name, d.department_name
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.department_id
    `);
    console.log('Employees with departments:', employeesWithDepts);


    const [avgSalaries] = await db.query(`
        SELECT d.department_name, AVG(e.salary) AS average_salary
        FROM employees e
        JOIN departments d ON e.department_id = d.department_id
        GROUP BY d.department_id
    `);
    console.log('Average salary per department:', avgSalaries);

    await db.end();
}

main().catch(err => console.error('Error:', err));

