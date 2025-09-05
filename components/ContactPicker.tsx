'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, X } from 'lucide-react';
import { ContactPickerProps } from '@/lib/types';
import { cn, validatePhoneNumber, formatPhoneNumber } from '@/lib/utils';

export function ContactPicker({
  variant = 'modal',
  onContactsSelected,
  className,
}: ContactPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [contacts, setContacts] = useState<string[]>([]);
  const [newContact, setNewContact] = useState('');

  const addContact = () => {
    if (newContact.trim() && validatePhoneNumber(newContact)) {
      const formatted = formatPhoneNumber(newContact);
      setContacts([...contacts, formatted]);
      setNewContact('');
    }
  };

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onContactsSelected(contacts);
    setIsOpen(false);
  };

  return (
    <div className={cn('', className)}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(true)}
        className="glass-card px-4 py-3 rounded-lg flex items-center space-x-3 text-text-primary hover:bg-opacity-20 transition-all duration-200"
      >
        <Users className="w-4 h-4 text-accent" />
        <span className="text-sm font-medium">
          Emergency Contacts ({contacts.length})
        </span>
      </motion.button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-card rounded-lg p-6 w-full max-w-md max-h-96 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">
                Emergency Contacts
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-text-secondary hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              {contacts.map((contact, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white bg-opacity-5 rounded-lg p-3"
                >
                  <span className="text-text-primary text-sm">{contact}</span>
                  <button
                    onClick={() => removeContact(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex space-x-2 mb-4">
              <input
                type="tel"
                value={newContact}
                onChange={(e) => setNewContact(e.target.value)}
                placeholder="Phone number"
                className="flex-1 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-3 py-2 text-text-primary placeholder-text-secondary text-sm"
              />
              <button
                onClick={addContact}
                className="btn-primary px-3 py-2"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 btn-secondary py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 btn-primary py-2"
              >
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
