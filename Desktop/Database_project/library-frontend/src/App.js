import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

// Custom CSS styles
const styles = {
  app: {
    fontFamily: 'Arial, sans-serif',
    margin: 0,
    padding: 0,
    backgroundColor: '#f5f5f5',
    minHeight: '100vh'
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '20px 0',
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  nav: {
    backgroundColor: '#343a40',
    padding: '0',
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  navButton: {
    backgroundColor: 'transparent',
    color: 'white',
    border: 'none',
    padding: '15px 25px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
    minWidth: '120px'
  },
  navButtonActive: {
    backgroundColor: '#495057'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    border: '1px solid #ddd'
  },
  form: {
    display: 'grid',
    gap: '15px',
    maxWidth: '600px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#333'
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    transition: 'border-color 0.3s ease'
  },
  button: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s ease'
  },
  buttonDanger: {
    backgroundColor: '#dc3545'
  },
  buttonSuccess: {
    backgroundColor: '#28a745'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px'
  },
  th: {
    backgroundColor: '#f8f9fa',
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid #dee2e6',
    fontWeight: 'bold'
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #dee2e6'
  },
  searchBox: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    width: '100%',
    maxWidth: '400px',
    marginBottom: '20px'
  },
  badge: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'white'
  },
  badgeSuccess: {
    backgroundColor: '#28a745'
  },
  badgeDanger: {
    backgroundColor: '#dc3545'
  },
  badgeWarning: {
    backgroundColor: '#ffc107',
    color: '#212529'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
  }
};

const LibraryManagement = () => {
  const [activeTab, setActiveTab] = useState('books');
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [checkouts, setCheckouts] = useState([]);
  const [fines, setFines] = useState([]);
  const [reports, setReports] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Form states
  const [bookForm, setBookForm] = useState({
    title: '', author: '', isbn: '', genre: '', publisher: '', publication_date: '', copies: 1
  });
  const [memberForm, setMemberForm] = useState({
    first_name: '', last_name: '', phone_number: '', email: '', house_no: '',
    lane: '', address1: '', address2: '', city: '', state: '', pincode: '', membership_expiration_date: ''
  });

  // API functions
  const fetchData = async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return [];
    }
  };

  const postData = async (endpoint, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error(`Error posting to ${endpoint}:`, error);
      return { error: 'Network error' };
    }
  };

  const deleteData = async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE'
      });
      return await response.json();
    } catch (error) {
      console.error(`Error deleting ${endpoint}:`, error);
      return { error: 'Network error' };
    }
  };

  // Load data based on active tab
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      switch (activeTab) {
        case 'books':
          const booksData = await fetchData('/books');
          setBooks(booksData);
          break;
        case 'members':
          const membersData = await fetchData('/members');
          setMembers(membersData);
          break;
        case 'checkouts':
          const checkoutsData = await fetchData('/checkouts');
          setCheckouts(checkoutsData);
          break;
        case 'fines':
          const finesData = await fetchData('/fines');
          setFines(finesData);
          break;
        case 'reports':
          const mostBorrowed = await fetchData('/reports/most-borrowed');
          const overdue = await fetchData('/reports/overdue');
          const genreStats = await fetchData('/reports/genre-stats');
          setReports({ mostBorrowed, overdue, genreStats });
          break;
        default:
          break;
      }
      setLoading(false);
    };
    loadData();
  }, [activeTab]);

  // Search functionality
  const handleSearch = async () => {
    if (activeTab === 'books' && searchTerm) {
      const searchResults = await fetchData(`/books/search?term=${searchTerm}`);
      setBooks(searchResults);
    }
  };

  // Form handlers
  const handleBookSubmit = async (e) => {
    e.preventDefault();
    const result = await postData('/books', bookForm);
    if (!result.error) {
      alert('Book added successfully!');
      setBookForm({
        title: '', author: '', isbn: '', genre: '', publisher: '', publication_date: '', copies: 1
      });
      const booksData = await fetchData('/books');
      setBooks(booksData);
    } else {
      alert('Error adding book: ' + result.error);
    }
  };

  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    const result = await postData('/members', memberForm);
    if (!result.error) {
      alert('Member added successfully!');
      setMemberForm({
        first_name: '', last_name: '', phone_number: '', email: '', house_no: '',
        lane: '', address1: '', address2: '', city: '', state: '', pincode: '', membership_expiration_date: ''
      });
      const membersData = await fetchData('/members');
      setMembers(membersData);
    } else {
      alert('Error adding member: ' + result.error);
    }
  };

  const handleCheckout = async (memberId, bookId) => {
    const result = await postData('/checkout', { member_id: memberId, book_id: bookId });
    if (!result.error) {
      alert('Book checked out successfully!');
      const checkoutsData = await fetchData('/checkouts');
      setCheckouts(checkoutsData);
    } else {
      alert('Error checking out book: ' + result.error);
    }
  };

  const handleReturn = async (checkoutId) => {
    const result = await postData('/return', { checkout_id: checkoutId });
    if (!result.error) {
      alert('Book returned successfully!');
      const checkoutsData = await fetchData('/checkouts');
      setCheckouts(checkoutsData);
    } else {
      alert('Error returning book: ' + result.error);
    }
  };

  const handleDelete = async (type, id) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      const result = await deleteData(`/${type}/${id}`);
      if (!result.error) {
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
        if (type === 'books') {
          const booksData = await fetchData('/books');
          setBooks(booksData);
        } else if (type === 'members') {
          const membersData = await fetchData('/members');
          setMembers(membersData);
        }
      } else {
        alert(`Error deleting ${type}: ` + result.error);
      }
    }
  };

  const handlePayFine = async (fineId) => {
    const result = await postData(`/fines/pay/${fineId}`, {});
    if (!result.error) {
      alert('Fine paid successfully!');
      const finesData = await fetchData('/fines');
      setFines(finesData);
    } else {
      alert('Error paying fine: ' + result.error);
    }
  };

  // Component renders
  const renderBooks = () => (
    <div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search books by title, author, or genre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchBox}
        />
        <button onClick={handleSearch} style={styles.button}>Search</button>
        <button onClick={() => {setSearchTerm(''); const loadBooks = async () => { const data = await fetchData('/books'); setBooks(data); }; loadBooks();}} style={styles.button}>
          Clear
        </button>
      </div>

      <div style={styles.card}>
        <h3>Add New Book</h3>
        <form onSubmit={handleBookSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Title:</label>
            <input
              type="text"
              value={bookForm.title}
              onChange={(e) => setBookForm({...bookForm, title: e.target.value})}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Author:</label>
            <input
              type="text"
              value={bookForm.author}
              onChange={(e) => setBookForm({...bookForm, author: e.target.value})}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>ISBN:</label>
            <input
              type="text"
              value={bookForm.isbn}
              onChange={(e) => setBookForm({...bookForm, isbn: e.target.value})}
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Genre:</label>
            <input
              type="text"
              value={bookForm.genre}
              onChange={(e) => setBookForm({...bookForm, genre: e.target.value})}
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Publisher:</label>
            <input
              type="text"
              value={bookForm.publisher}
              onChange={(e) => setBookForm({...bookForm, publisher: e.target.value})}
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Publication Date:</label>
            <input
              type="date"
              value={bookForm.publication_date}
              onChange={(e) => setBookForm({...bookForm, publication_date: e.target.value})}
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Number of Copies:</label>
            <input
              type="number"
              min="1"
              value={bookForm.copies}
              onChange={(e) => setBookForm({...bookForm, copies: parseInt(e.target.value)})}
              style={styles.input}
            />
          </div>
          <button type="submit" style={styles.button}>Add Book</button>
        </form>
      </div>

      <div style={styles.card}>
        <h3>Books List</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Author</th>
                <th style={styles.th}>Genre</th>
                <th style={styles.th}>ISBN</th>
                <th style={styles.th}>Copies</th>
                <th style={styles.th}>Available</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.Book_ID}>
                  <td style={styles.td}>{book.Title}</td>
                  <td style={styles.td}>{book.Author}</td>
                  <td style={styles.td}>{book.Genre}</td>
                  <td style={styles.td}>{book.ISBN}</td>
                  <td style={styles.td}>{book.total_copies}</td>
                  <td style={styles.td}>
                    <span style={{...styles.badge, ...(book.available_copies > 0 ? styles.badgeSuccess : styles.badgeDanger)}}>
                      {book.available_copies}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleDelete('books', book.Book_ID)}
                      style={{...styles.button, ...styles.buttonDanger, fontSize: '14px', padding: '8px 12px'}}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const renderMembers = () => (
    <div>
      <div style={styles.card}>
        <h3>Add New Member</h3>
        <form onSubmit={handleMemberSubmit} style={styles.form}>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
            <div style={styles.formGroup}>
              <label style={styles.label}>First Name:</label>
              <input
                type="text"
                value={memberForm.first_name}
                onChange={(e) => setMemberForm({...memberForm, first_name: e.target.value})}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Last Name:</label>
              <input
                type="text"
                value={memberForm.last_name}
                onChange={(e) => setMemberForm({...memberForm, last_name: e.target.value})}
                style={styles.input}
                required
              />
            </div>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone:</label>
              <input
                type="tel"
                value={memberForm.phone_number}
                onChange={(e) => setMemberForm({...memberForm, phone_number: e.target.value})}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email:</label>
              <input
                type="email"
                value={memberForm.email}
                onChange={(e) => setMemberForm({...memberForm, email: e.target.value})}
                style={styles.input}
              />
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Address:</label>
            <input
              type="text"
              placeholder="House No"
              value={memberForm.house_no}
              onChange={(e) => setMemberForm({...memberForm, house_no: e.target.value})}
              style={{...styles.input, marginBottom: '10px'}}
            />
            <input
              type="text"
              placeholder="Lane"
              value={memberForm.lane}
              onChange={(e) => setMemberForm({...memberForm, lane: e.target.value})}
              style={{...styles.input, marginBottom: '10px'}}
            />
            <input
              type="text"
              placeholder="Address Line 1"
              value={memberForm.address1}
              onChange={(e) => setMemberForm({...memberForm, address1: e.target.value})}
              style={{...styles.input, marginBottom: '10px'}}
            />
            <input
              type="text"
              placeholder="Address Line 2"
              value={memberForm.address2}
              onChange={(e) => setMemberForm({...memberForm, address2: e.target.value})}
              style={styles.input}
            />
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px'}}>
            <div style={styles.formGroup}>
              <label style={styles.label}>City:</label>
              <input
                type="text"
                value={memberForm.city}
                onChange={(e) => setMemberForm({...memberForm, city: e.target.value})}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>State:</label>
              <input
                type="text"
                value={memberForm.state}
                onChange={(e) => setMemberForm({...memberForm, state: e.target.value})}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Pincode:</label>
              <input
                type="text"
                value={memberForm.pincode}
                onChange={(e) => setMemberForm({...memberForm, pincode: e.target.value})}
                style={styles.input}
              />
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Membership Expiration:</label>
            <input
              type="date"
              value={memberForm.membership_expiration_date}
              onChange={(e) => setMemberForm({...memberForm, membership_expiration_date: e.target.value})}
              style={styles.input}
            />
          </div>
          <button type="submit" style={styles.button}>Add Member</button>
        </form>
      </div>

      <div style={styles.card}>
        <h3>Members List</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>City</th>
                <th style={styles.th}>Active Checkouts</th>
                <th style={styles.th}>Total Fines</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.Member_ID}>
                  <td style={styles.td}>{member.First_Name} {member.Last_Name}</td>
                  <td style={styles.td}>{member.Email}</td>
                  <td style={styles.td}>{member.Phone_Number}</td>
                  <td style={styles.td}>{member.City}</td>
                  <td style={styles.td}>
                    <span style={{...styles.badge, ...styles.badgeWarning}}>
                      {member.active_checkouts}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{...styles.badge, ...(member.total_fines > 0 ? styles.badgeDanger : styles.badgeSuccess)}}>
                      {member.total_fines} FCFA
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleDelete('members', member.Member_ID)}
                      style={{...styles.button, ...styles.buttonDanger, fontSize: '14px', padding: '8px 12px'}}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const renderCheckouts = () => (
    <div>
      <div style={styles.card}>
        <h3>Quick Checkout</h3>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '15px', alignItems: 'end'}}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Select Member:</label>
            <select
              style={styles.input}
              onChange={(e) => {
                if (e.target.value) {
                  const bookSelect = document.getElementById('book-select');
                  if (bookSelect.value) {
                    handleCheckout(parseInt(e.target.value), parseInt(bookSelect.value));
                    e.target.value = '';
                    bookSelect.value = '';
                  }
                }
              }}
            >
              <option value="">Choose member...</option>
              {members.map((member) => (
                <option key={member.Member_ID} value={member.Member_ID}>
                  {member.First_Name} {member.Last_Name}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Select Book:</label>
            <select id="book-select" style={styles.input}>
              <option value="">Choose book...</option>
              {books.filter(book => book.available_copies > 0).map((book) => (
                <option key={book.Book_ID} value={book.Book_ID}>
                  {book.Title} by {book.Author}
                </option>
              ))}
            </select>
          </div>
          <button 
            onClick={() => {
              const memberSelect = document.querySelector('select');
              const bookSelect = document.getElementById('book-select');
              if (memberSelect.value && bookSelect.value) {
                handleCheckout(parseInt(memberSelect.value), parseInt(bookSelect.value));
                memberSelect.value = '';
                bookSelect.value = '';
              } else {
                alert('Please select both member and book');
              }
            }}
            style={styles.button}
          >
            Checkout
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <h3>Active Checkouts</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Book</th>
                <th style={styles.th}>Member</th>
                <th style={styles.th}>Checkout Date</th>
                <th style={styles.th}>Due Date</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {checkouts.filter(checkout => !checkout.Return_Date).map((checkout) => (
                <tr key={checkout.Checkout_ID}>
                  <td style={styles.td}>{checkout.Title}</td>
                  <td style={styles.td}>{checkout.First_Name} {checkout.Last_Name}</td>
                  <td style={styles.td}>{new Date(checkout.Checkout_Date).toLocaleDateString()}</td>
                  <td style={styles.td}>{new Date(checkout.Due_Date).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    <span style={{...styles.badge, ...(checkout.days_overdue > 0 ? styles.badgeDanger : styles.badgeSuccess)}}>
                      {checkout.days_overdue > 0 ? `${checkout.days_overdue} days overdue` : 'On time'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleReturn(checkout.Checkout_ID)}
                      style={{...styles.button, ...styles.buttonSuccess, fontSize: '14px', padding: '8px 12px'}}
                    >
                      Return
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={styles.card}>
        <h3>Checkout History</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Book</th>
                <th style={styles.th}>Member</th>
                <th style={styles.th}>Checkout Date</th>
                <th style={styles.th}>Due Date</th>
                <th style={styles.th}>Return Date</th>
              </tr>
            </thead>
            <tbody>
              {checkouts.filter(checkout => checkout.Return_Date).slice(0, 10).map((checkout) => (
                <tr key={checkout.Checkout_ID}>
                  <td style={styles.td}>{checkout.Title}</td>
                  <td style={styles.td}>{checkout.First_Name} {checkout.Last_Name}</td>
                  <td style={styles.td}>{new Date(checkout.Checkout_Date).toLocaleDateString()}</td>
                  <td style={styles.td}>{new Date(checkout.Due_Date).toLocaleDateString()}</td>
                  <td style={styles.td}>{new Date(checkout.Return_Date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const renderFines = () => (
    <div>
      <div style={styles.card}>
        <h3>Fines Management</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Member</th>
                <th style={styles.th}>Book</th>
                <th style={styles.th}>Fine Amount</th>
                <th style={styles.th}>Fine Date</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fines.map((fine) => (
                <tr key={fine.Fine_ID}>
                  <td style={styles.td}>{fine.First_Name} {fine.Last_Name}</td>
                  <td style={styles.td}>{fine.Title}</td>
                  <td style={styles.td}>{fine.Fine_Amount} FCFA</td>
                  <td style={styles.td}>{new Date(fine.Fine_Date).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    <span style={{...styles.badge, ...(fine.Status === 'Paid' ? styles.badgeSuccess : styles.badgeDanger)}}>
                      {fine.Status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {fine.Status === 'Unpaid' && (
                      <button
                        onClick={() => handlePayFine(fine.Fine_ID)}
                        style={{...styles.button, ...styles.buttonSuccess, fontSize: '14px', padding: '8px 12px'}}
                      >
                        Mark as Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const renderReports = () => (
    <div>
      <div style={styles.grid}>
        <div style={styles.card}>
          <h3>Most Borrowed Books</h3>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Author</th>
                  <th style={styles.th}>Borrow Count</th>
                </tr>
              </thead>
              <tbody>
                {(reports.mostBorrowed || []).map((book, index) => (
                  <tr key={index}>
                    <td style={styles.td}>{book.Title}</td>
                    <td style={styles.td}>{book.Author}</td>
                    <td style={styles.td}>
                      <span style={{...styles.badge, ...styles.badgeSuccess}}>
                        {book.borrow_count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={styles.card}>
          <h3>Overdue Books</h3>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Member</th>
                  <th style={styles.th}>Days Overdue</th>
                </tr>
              </thead>
              <tbody>
                {(reports.overdue || []).map((item, index) => (
                  <tr key={index}>
                    <td style={styles.td}>{item.Title}</td>
                    <td style={styles.td}>{item.First_Name} {item.Last_Name}</td>
                    <td style={styles.td}>
                      <span style={{...styles.badge, ...styles.badgeDanger}}>
                        {item.days_overdue}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={styles.card}>
          <h3>Genre Statistics</h3>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Genre</th>
                  <th style={styles.th}>Checkout Count</th>
                </tr>
              </thead>
              <tbody>
                {(reports.genreStats || []).map((genre, index) => (
                  <tr key={index}>
                    <td style={styles.td}>{genre.Genre}</td>
                    <td style={styles.td}>
                      <span style={{...styles.badge, ...styles.badgeWarning}}>
                        {genre.checkout_count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1>📚 Library Management System</h1>
        <p>Manage your library's books, members, and transactions</p>
      </header>

      <nav style={styles.nav}>
        {['books', 'members', 'checkouts', 'fines', 'reports'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.navButton,
              ...(activeTab === tab ? styles.navButtonActive : {})
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#495057'}
            onMouseLeave={(e) => e.target.style.backgroundColor = activeTab === tab ? '#495057' : 'transparent'}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      <div style={styles.container}>
        {activeTab === 'books' && renderBooks()}
        {activeTab === 'members' && renderMembers()}
        {activeTab === 'checkouts' && renderCheckouts()}
        {activeTab === 'fines' && renderFines()}
        {activeTab === 'reports' && renderReports()}
      </div>
    </div>
  );
};

export default LibraryManagement;