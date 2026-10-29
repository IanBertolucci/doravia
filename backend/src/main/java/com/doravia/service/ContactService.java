package com.doravia.service;

import com.doravia.model.Contact;
import com.doravia.repository.ContactRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContactService {

    private final ContactRepository contactRepository;

    public ContactService(ContactRepository contactRepository) {
        this.contactRepository = contactRepository;
    }

    public List<Contact> findAll() {
        return contactRepository.findAllByOrderByDisplayOrder();
    }

    public Contact findById(Long id) {
        return contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
    }

    public Contact create(String name, String phone, String relation) {
        int maxOrder = (int) contactRepository.count();
        Contact contact = new Contact(name, phone, relation, maxOrder);
        return contactRepository.save(contact);
    }

    public Contact update(Long id, String name, String phone, String relation) {
        Contact contact = findById(id);
        contact.setName(name);
        contact.setPhone(phone);
        contact.setRelation(relation);
        return contactRepository.save(contact);
    }

    public void delete(Long id) {
        contactRepository.deleteById(id);
    }

    public void reorder(List<Long> contactIds) {
        for (int i = 0; i < contactIds.size(); i++) {
            Contact contact = findById(contactIds.get(i));
            contact.setDisplayOrder(i);
            contactRepository.save(contact);
        }
    }
}
