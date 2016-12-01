DROP DATABASE online_bookstore;
CREATE DATABASE online_bookstore;
USE online_bookstore;

CREATE TABLE customer(
  name VARCHAR(100) NOT NULL, 
  user VARCHAR(20), 
  password VARCHAR(20) NOT NULL, 
  card_no VARCHAR(16) NOT NULL CHECK (LENGTHB(card_no) = 16), 
  address VARCHAR(100) NOT NULL, 
  phone_no INTEGER NOT NULL, 
  PRIMARY KEY(user)
);


CREATE TABLE book(
  ISBN VARCHAR(10), 
  title VARCHAR(200) NOT NULL, 
  authors VARCHAR(100), 
  publisher VARCHAR(100), 
  year_pub INTEGER, 
  copies INTEGER CHECK (copies>=0), 
  price REAL CHECK (price>=0), 
  tag VARCHAR(50),
  format VARCHAR(9) CHECK(format="hardcopy" OR format="softcopy"), 
  subject VARCHAR(50), 
  image VARCHAR(100) NOT NULL DEFAULT "http://placekitten.com/400/500",
  PRIMARY KEY(ISBN) 
);


CREATE TABLE invoice(
  number INTEGER AUTO_INCREMENT, 
  date DATE NOT NULL, 
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
  copies INTEGER CHECK (copies>0), 
  PRIMARY KEY (number, ISBN), 
  FOREIGN KEY (number) REFERENCES invoice(number), 
  FOREIGN KEY (ISBN) REFERENCES book(ISBN)
);

CREATE TABLE feedback(
  ISBN VARCHAR(10), 
  user VARCHAR(20), 
  comment TEXT, 
  date DATE, 
  score INTEGER CHECK (score>0 AND score <=10),
  PRIMARY KEY (ISBN, user),
  FOREIGN KEY (ISBN) REFERENCES book(ISBN), 
  FOREIGN KEY (user) REFERENCES customer(user)
);

CREATE TABLE rating(
  ISBN VARCHAR(10), 
  user_feedback VARCHAR(20), 
  user_rate VARCHAR(20) CHECK (user_rate != user_feedback), 
  rate INTEGER CHECK (rate>=0 AND rate<3), 
  PRIMARY KEY(ISBN, user_feedback, user_rate), 
  FOREIGN KEY (ISBN, user_feedback) REFERENCES feedback(ISBN, user), 
  FOREIGN KEY (user_rate) REFERENCES customer(user)
);

