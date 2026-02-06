import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ArrowLeft, CreditCard, Plus, Trash2, Check, Star } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentMethod {
  id: string;
  type: 'visa' | 'mastercard' | 'amex' | 'discover';
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  holderName: string;
  isDefault: boolean;
}

interface PaymentMethodsProps {
  onBack: () => void;
}

export function PaymentMethods({ onBack }: PaymentMethodsProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'visa',
      last4: '4242',
      expiryMonth: '12',
      expiryYear: '2025',
      holderName: 'John Doe',
      isDefault: true,
    },
    {
      id: '2',
      type: 'mastercard',
      last4: '5555',
      expiryMonth: '08',
      expiryYear: '2026',
      holderName: 'John Doe',
      isDefault: false,
    },
  ]);

  const [showAddCard, setShowAddCard] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; methodId: string }>({
    isOpen: false,
    methodId: '',
  });

  // New card form
  const [cardNumber, setCardNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');

  const getCardIcon = (type: PaymentMethod['type']) => {
    const icons = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳',
    };
    return icons[type];
  };

  const getCardColor = (type: PaymentMethod['type']) => {
    const colors = {
      visa: 'from-blue-500 to-blue-600',
      mastercard: 'from-orange-500 to-red-600',
      amex: 'from-green-500 to-teal-600',
      discover: 'from-purple-500 to-pink-600',
    };
    return colors[type];
  };

  const handleSetDefault = (methodId: string) => {
    setMethods(methods.map(m => ({
      ...m,
      isDefault: m.id === methodId
    })));
    toast.success('Default payment method updated');
  };

  const handleDelete = (methodId: string) => {
    const method = methods.find(m => m.id === methodId);
    if (method?.isDefault && methods.length > 1) {
      toast.error('Cannot delete default payment method. Set another as default first.');
      return;
    }
    setDeleteConfirm({ isOpen: true, methodId });
  };

  const handleDeleteConfirm = () => {
    setMethods(methods.filter(m => m.id !== deleteConfirm.methodId));
    setDeleteConfirm({ isOpen: false, methodId: '' });
    toast.success('Payment method removed');
  };

  const handleAddCard = () => {
    if (!cardNumber || !holderName || !expiryMonth || !expiryYear || !cvv) {
      toast.error('Please fill in all fields');
      return;
    }

    const newCard: PaymentMethod = {
      id: Date.now().toString(),
      type: 'visa', // Would be detected from card number
      last4: cardNumber.slice(-4),
      expiryMonth,
      expiryYear,
      holderName,
      isDefault: methods.length === 0,
    };

    setMethods([...methods, newCard]);
    setShowAddCard(false);
    setCardNumber('');
    setHolderName('');
    setExpiryMonth('');
    setExpiryYear('');
    setCvv('');
    toast.success('Payment method added successfully');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Billing
          </button>
          <h1 className="text-3xl font-bold mb-2">Payment Methods</h1>
          <p className="text-muted-foreground">Manage your payment methods</p>
        </div>

        {/* Payment Methods List */}
        <div className="space-y-4 mb-6">
          {methods.map((method) => (
            <Card key={method.id} className="p-6">
              <div className="flex items-center gap-4">
                {/* Card Visual */}
                <div className={`h-24 w-40 rounded-lg bg-gradient-to-br ${getCardColor(method.type)} p-4 flex flex-col justify-between flex-shrink-0`}>
                  <div className="text-white text-2xl">{getCardIcon(method.type)}</div>
                  <div className="text-white">
                    <p className="text-xs opacity-80">{method.holderName}</p>
                    <p className="font-mono text-sm">•••• {method.last4}</p>
                  </div>
                </div>

                {/* Card Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-lg capitalize">{method.type}</p>
                    {method.isDefault && (
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Expires {method.expiryMonth}/{method.expiryYear}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {method.holderName}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {!method.isDefault && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSetDefault(method.id)}
                    >
                      Set as Default
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(method.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Add Payment Method */}
        {!showAddCard ? (
          <Button onClick={() => setShowAddCard(true)}>
            <Plus className="h-4 w-4" />
            Add Payment Method
          </Button>
        ) : (
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Add New Card</h3>
            <div className="space-y-4">
              <Input
                label="Card Number"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                maxLength={16}
              />
              <Input
                label="Cardholder Name"
                type="text"
                placeholder="John Doe"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
              />
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Month"
                  type="text"
                  placeholder="MM"
                  value={expiryMonth}
                  onChange={(e) => setExpiryMonth(e.target.value)}
                  maxLength={2}
                />
                <Input
                  label="Year"
                  type="text"
                  placeholder="YYYY"
                  value={expiryYear}
                  onChange={(e) => setExpiryYear(e.target.value)}
                  maxLength={4}
                />
                <Input
                  label="CVV"
                  type="text"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  maxLength={4}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddCard}>Add Card</Button>
                <Button variant="ghost" onClick={() => setShowAddCard(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Security Notice */}
        <Card className="p-4 mt-6 bg-muted/50">
          <p className="text-sm text-muted-foreground">
            🔒 Your payment information is encrypted and secure. We never store your full card number or CVV.
          </p>
        </Card>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Remove Payment Method"
        message="Are you sure you want to remove this payment method?"
        confirmLabel="Remove"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteConfirm({ isOpen: false, methodId: '' })}
      />
    </div>
  );
}
