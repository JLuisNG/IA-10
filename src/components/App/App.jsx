import React, { Component } from 'react';
import NewContact from '../NewContact/NewContact';
import { ContactsList } from '../ContactsList/ContactsList';
import { ContactFilter } from '../ContactFilter/ContactFilter';
import { nanoid } from 'nanoid';
import { NewContactContainer, Container } from './App.style';

export class App extends Component {
  state = {
    contacts: [
      { id: 'id-1', name: 'Rosie Simpson', number: '459-12-56' },
      { id: 'id-2', name: 'Hermione Kline', number: '443-89-12' },
      { id: 'id-3', name: 'Eden Clements', number: '645-17-79' },
      { id: 'id-4', name: 'Annie Copeland', number: '227-91-26' },
    ],
    filter: '',
  };

  handleSubmitContact = (e) => {
    e.preventDefault();
    const nameContact = e.target.name.value;
    const numberContact = e.target.numberPhone.value;
    const contacts = this.state.contacts;

    const newContact = {
      id: nanoid(),
      name: nameContact,
      number: numberContact,
    };

    if (
      !contacts.some(
        (contact) =>
          contact.name.toLowerCase() === nameContact.toLowerCase()
      )
    ) {
      this.setState((prevState) => ({
        contacts: [...prevState.contacts, newContact],
      }));
    } else {
      alert(`${nameContact} is already in contacts`);
    }
  };

  handleSearch = (e) => {
    this.setState({
      filter: e.target.value,
    });
  };

  handleDeleteContact = (contactId) => {
    this.setState((prevState) => ({
      contacts: prevState.contacts.filter((contact) => contact.id !== contactId),
    }));
  };

  render() {
    const { contacts, filter } = this.state;
    return (
      <main>
        <Container>
          <NewContactContainer>
            <h2>Phonebook</h2>
            <NewContact createContact={this.handleSubmitContact} />
          </NewContactContainer>
          <h2>Contacts</h2>
          <ContactFilter validator={this.handleSearch} />
          <ContactsList
            contacts={contacts}
            search={filter}
            delContact={this.handleDeleteContact}
          />
        </Container>
      </main>
    );
  }
}
