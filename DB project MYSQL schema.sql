DROP DATABASE online_bookstore;
CREATE DATABASE online_bookstore;
USE online_bookstore;

CREATE TABLE customer(
  name VARCHAR(100), 
  user VARCHAR(20), 
  password VARCHAR(20), 
  card_no VARCHAR(16), 
  address VARCHAR(100), 
  phone_no INTEGER, 
  PRIMARY KEY(user)
);


CREATE TABLE book(
  ISBN VARCHAR(10), 
  title VARCHAR(100), 
  authors VARCHAR(100), 
  publisher VARCHAR(100), 
  year_pub INTEGER, 
  copies INTEGER, 
  price REAL, 
  tag VARCHAR(50),
  format VARCHAR(9) CHECK(format="hardcopy" OR format="softcopy"), 
  subject VARCHAR(50), 
  image VARCHAR(100) DEFAULT "http://placekitten.com/400/500",
  PRIMARY KEY(ISBN) 
);


CREATE TABLE invoice(
  number INTEGER, 
  date DATE, 
  status VARCHAR(50),
  user VARCHAR(20) NOT NULL, 
  PRIMARY KEY(number),
  FOREIGN KEY (user) REFERENCES customer(user)
);

CREATE TABLE book_order(
  number INTEGER, 
  user VARCHAR(20), 
  PRIMARY KEY(user, number), 
  FOREIGN KEY (user) REFERENCES customer(user), 
  FOREIGN KEY (number) REFERENCES invoice(number) 
);

CREATE TABLE content(
  number INTEGER, 
  ISBN VARCHAR(10), 
  copies INTEGER, 
  PRIMARY KEY (number, ISBN), 
  FOREIGN KEY (number) REFERENCES invoice(number), 
  FOREIGN KEY (ISBN) REFERENCES book(ISBN)
);

CREATE TABLE feedback(
  ISBN VARCHAR(10), 
  user VARCHAR(20), 
  comment TEXT, 
  date DATE, 
  score INTEGER,
  PRIMARY KEY (ISBN, user),
  FOREIGN KEY (ISBN) REFERENCES book(ISBN), 
  FOREIGN KEY (user) REFERENCES customer(user)
);

CREATE TABLE rating(
  ISBN VARCHAR(10), 
  user_feedback VARCHAR(20), 
  user_rate VARCHAR(20), 
  rate INTEGER, 
  PRIMARY KEY(ISBN, user_feedback, user_rate), 
  FOREIGN KEY (ISBN, user_feedback) REFERENCES feedback(ISBN, user), 
  FOREIGN KEY (user_rate) REFERENCES customer(user)
);

