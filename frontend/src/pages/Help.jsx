import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/common/Icons';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Toast from '../components/common/Toast';
import FAQAccordion from '../components/help/FAQAccordion';
import { useSystemStatus } from '../hooks/useSystemStatus';
import { useSettings } from '../hooks/useSettings';

const FAQ_ITEMS = [
  {
    id: 'faq-1',
    question: "Why can't I delete a department?",
    answer:
      'Departments with employees still assigned can\'t be deleted. Move or remove those employees first, then try again from the Departments page.',
  },
  {
    id: 'faq-2',
    question: "An employee isn't showing up on the Attendance page",
    answer:
      'Only employees with an Active or Inactive status appear on the Attendance page — Terminated employees are excluded. Check the employee\'s status on the Employees page.',
  },
  {
    id: 'faq-3',
    question: 'How is "Salary Spend" calculated on Departments and Reports?',
    answer:
      "It's the sum of the salary field for every employee currently assigned to that department, calculated live from the database.",
  },
  {
    id: 'faq-4',
    question: 'Can I undo marking attendance?',
    answer:
      'Yes — click the X button on the right of any row in the Attendance table to clear that day\'s status for an employee.',
  },
  {
    id: 'faq-5',
    question: "I don't see any notifications",
    answer:
      'Notifications are generated from recent activity (new hires, updates, unmarked attendance, empty departments). Check that the relevant category is enabled in Settings → Notification Preferences.',
  },
  {
    id: 'faq-6',
    question: 'Where is my data stored?',
    answer:
      'Employee, department, and attendance records live in the MySQL database via the Laravel API. Your profile and preference settings are stored locally in this browser only.',
  },
];

function Help() {
  const navigate = useNavigate();
  const { status, checkedAt, recheck } = useSystemStatus();
  const { settings } = useSettings();
  const [query, setQuery] = useState('');
  const [form, setForm] = useState({
    name: settings.profile.name,
    email: settings.profile.email,
    subject: '',
    priority: 'normal',
    message: '',
  });
  const [toast, setToast] = useState(null);

  const filteredFaqs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ_ITEMS;
    return FAQ_ITEMS.filter(
      (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
    );
  }, [query]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      setToast({ message: 'Please fill in a subject and message.', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Priority: ${form.priority}`,
      '',
      form.message,
    ].join('\n');

    const mailto = `mailto:support@empmanage.com?subject=${encodeURIComponent(
      `[${form.priority.toUpperCase()}] ${form.subject}`
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    setToast({ message: 'Opening your email client to send this request…' });
    setTimeout(() => setToast(null), 3000);
  };

  const statusLabel = { up: 'All Systems Operational', down: 'Service Unavailable', checking: 'Checking…' }[status];
  const StatusIcon = status === 'up' ? Icons.CheckCircle : status === 'down' ? Icons.XCircle : Icons.AlertCircle;

  return (
    <>
      <div className="content-section animate-fade-in-up">
        <div className="content-section-header">
          <div>
            <div className="content-section-title">Help & Support</div>
            <div className="content-section-subtitle">Get assistance with EmpManage</div>
          </div>
          <div className="content-section-actions">
            <span className={`status-badge-pill ${status}`}>
              <StatusIcon /> {statusLabel}
            </span>
            <Button variant="outline" onClick={recheck}>
              <Icons.RotateCcw /> Recheck
            </Button>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          {checkedAt && (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '-8px', marginBottom: '20px' }}>
              Backend API last checked at {checkedAt.toLocaleTimeString()}
            </p>
          )}

          <div className="help-grid">
            <div className="help-contact-card">
              <div className="help-contact-icon">
                <Icons.BookOpen />
              </div>
              <div>
                <div className="settings-row-label">Browse Documentation</div>
                <div className="settings-row-desc" style={{ marginBottom: '10px' }}>
                  Step-by-step guides for every module — Employees, Departments,
                  Attendance, Reports, and more.
                </div>
                <Button variant="outline" onClick={() => navigate('/documentation')}>
                  View Docs
                </Button>
              </div>
            </div>

            <div className="help-contact-card">
              <div className="help-contact-icon">
                <Icons.MessageCircle />
              </div>
              <div>
                <div className="settings-row-label">Contact Support</div>
                <div className="settings-row-desc">
                  Use the form below and we'll open a pre-filled email to
                  support@empmanage.com for you.
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '32px' }}>
            <div className="content-section-title" style={{ marginBottom: '16px' }}>
              Frequently Asked Questions
            </div>
            <input
              type="text"
              className="form-input"
              style={{ marginBottom: '16px', maxWidth: '360px' }}
              placeholder="Search FAQs…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <FAQAccordion items={filteredFaqs} />
          </div>

          <div style={{ marginTop: '32px' }}>
            <div className="content-section-title" style={{ marginBottom: '16px' }}>
              Still need help? Send us a message
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <Input fullWidth label="Your Name" name="name" value={form.name} onChange={handleChange} />
                <Input
                  fullWidth
                  label="Your Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                />
                <Input fullWidth label="Subject" name="subject" value={form.subject} onChange={handleChange} placeholder="Briefly describe the issue" />
                <Input
                  fullWidth
                  as="select"
                  label="Priority"
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'normal', label: 'Normal' },
                    { value: 'high', label: 'High' },
                  ]}
                />
                <Input
                  fullWidth
                  as="textarea"
                  label="Message"
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us what's going on…"
                />
              </div>
              <div style={{ marginTop: '16px' }}>
                <Button type="submit">
                  <Icons.Send /> Send Message
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Toast toast={toast} />
    </>
  );
}

export default Help;
