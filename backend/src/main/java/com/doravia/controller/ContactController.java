package com.doravia.controller;

import com.doravia.dto.ContactDTO;
import com.doravia.model.Contact;
import com.doravia.service.ContactService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/contacts")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @GetMapping
    public ResponseEntity<List<ContactDTO>> list() {
        List<ContactDTO> contacts = contactService.findAll().stream()
                .map(c -> new ContactDTO(c.getId(), c.getName(), c.getPhone(), c.getRelation(), c.getDisplayOrder()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(contacts);
    }

    @PostMapping
    public ResponseEntity<ContactDTO> create(@RequestBody Map<String, String> body) {
        Contact contact = contactService.create(body.get("name"), body.get("phone"), body.get("relation"));
        return ResponseEntity.ok(new ContactDTO(contact.getId(), contact.getName(), contact.getPhone(), contact.getRelation(), contact.getDisplayOrder()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContactDTO> update(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Contact contact = contactService.update(id, body.get("name"), body.get("phone"), body.get("relation"));
        return ResponseEntity.ok(new ContactDTO(contact.getId(), contact.getName(), contact.getPhone(), contact.getRelation(), contact.getDisplayOrder()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        contactService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/reorder")
    public ResponseEntity<Void> reorder(@RequestBody Map<String, List<Long>> body) {
        contactService.reorder(body.get("contactIds"));
        return ResponseEntity.ok().build();
    }
}
