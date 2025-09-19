import { useState, useEffect } from "react";
import axios from "axios";
import ContactForm from "./components/ContactForm";
import ContactList from "./components/ContactList";
import './index.css'

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"; // fallback to localhost:5000

function App() {
  const [contacts, setContacts] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 5;

  // Fetch contacts from backend
  const fetchContacts = async () => {
    try {
      const res = await axios.get(`${API_URL}/contacts?page=${page}&limit=${limit}`);
      setContacts(res.data.contacts);
      setTotal(res.data.total);
    } catch (error) {
      console.error("Error fetching contacts:", error.message);
    }
  };

  // Run once on load + when page changes
  useEffect(() => {
    fetchContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Add new contact
  const addContact = async (newContact) => {
    try {
      await axios.post(`${API_URL}/contacts`, newContact);
      fetchContacts(); // Refresh contacts after adding
    } catch (error) {
      console.error("Error adding contact:", error.message);
    }
  };

  // Delete contact
  const deleteContact = async (id) => {
    try {
      await axios.delete(`${API_URL}/contacts/${id}`);
      fetchContacts(); // Refresh contacts after deleting
    } catch (error) {
      console.error("Error deleting contact:", error.message);
    }
  };

  return (
    <div className="container">
      <h1>Contact Book</h1>
      <ContactForm onAdd={addContact} />
      <ContactList contacts={contacts} onDelete={deleteContact} />
      <div>
        <button onClick={() => setPage(page - 1)} disabled={page === 1}>
          Prev
        </button>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page * limit >= total}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default App;
