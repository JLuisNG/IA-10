import { Contact, ContactsWrapper } from './ContactsList.style';
import PropTypes from 'prop-types';

export const ContactsList = ({ contacts, search, delContact }) => {
  return (
    <div>
      <ContactsWrapper>
        {contacts
          .filter(contact =>
            contact.name.toLowerCase().includes(search.toLowerCase())
          )
          .map(filtered => (
            <Contact key={filtered.id}>
              {filtered.name} {filtered.number}
              <button onClick={() => delContact(filtered.id)}>Delete</button>
            </Contact>
          ))}
      </ContactsWrapper>
    </div>
  );
};

ContactsList.protoTypes = {
  contacts: PropTypes.array,
  search: PropTypes.string,
  delContact: PropTypes.func,
};
