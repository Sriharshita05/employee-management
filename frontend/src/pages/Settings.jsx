import { useEffect, useState } from 'react';
import { Icons } from '../components/common/Icons';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Toast from '../components/common/Toast';
import { useSettings } from '../hooks/useSettings';

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="settings-row">
      <div>
        <div className="settings-row-label">{label}</div>
        {description && <div className="settings-row-desc">{description}</div>}
      </div>
      <label className="toggle-switch">
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="toggle-slider" />
      </label>
    </div>
  );
}

function Settings() {
  const { settings, updateSettings, resetSettings, setTheme } = useSettings();
  const [profileDraft, setProfileDraft] = useState(settings.profile);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setProfileDraft(settings.profile);
  }, [settings.profile]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    if (!profileDraft.name.trim()) {
      showToast('Name cannot be empty.', 'error');
      return;
    }
    updateSettings({ profile: profileDraft });
    showToast('Profile updated successfully!');
  };

  const handleTogglePref = (key) => (e) => {
    updateSettings({ notificationPrefs: { [key]: e.target.checked } });
    showToast('Notification preference saved.');
  };

  const handleCompactToggle = (e) => {
    updateSettings({ compactMode: e.target.checked });
    showToast(e.target.checked ? 'Compact mode enabled.' : 'Compact mode disabled.');
  };

  const handleThemeChange = (theme) => {
    if (theme === settings.theme) return;
    setTheme(theme);
    showToast(theme === 'dark' ? 'Dark theme enabled.' : 'Light theme enabled.');
  };

  const handleResetClick = () => {
    if (!confirmingReset) {
      setConfirmingReset(true);
      return;
    }
    resetSettings();
    setConfirmingReset(false);
    showToast('Settings reset to defaults.');
  };

  return (
    <>
      <div className="content-section animate-fade-in-up">
        <div className="content-section-header">
          <div>
            <div className="content-section-title">Settings</div>
            <div className="content-section-subtitle">
              Configure application preferences and account settings
            </div>
          </div>
        </div>

        <form onSubmit={handleProfileSave}>
          <div className="settings-section">
            <div className="settings-section-header">
              <Icons.Users />
              <span className="settings-section-title">Profile</span>
            </div>
            <div className="settings-section-desc">
              This information is shown in the sidebar and navigation bar.
            </div>
            <div className="form-grid">
              <Input
                fullWidth
                label="Full Name"
                name="name"
                value={profileDraft.name}
                onChange={handleProfileChange}
              />
              <Input
                fullWidth
                label="Role / Title"
                name="role"
                value={profileDraft.role}
                onChange={handleProfileChange}
              />
              <Input
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={profileDraft.email}
                onChange={handleProfileChange}
              />
            </div>
            <div style={{ marginTop: '16px' }}>
              <Button type="submit">Save Profile</Button>
            </div>
          </div>
        </form>

        <div className="settings-section">
          <div className="settings-section-header">
            <Icons.Bell />
            <span className="settings-section-title">Notification Preferences</span>
          </div>
          <div className="settings-section-desc">
            Choose which alerts show up in your notification center.
          </div>
          <ToggleRow
            label="New hire & employee updates"
            description="Notify when employees are added or updated"
            checked={settings.notificationPrefs.newHires}
            onChange={handleTogglePref('newHires')}
          />
          <ToggleRow
            label="Attendance alerts"
            description="Notify about unmarked or absent employees each day"
            checked={settings.notificationPrefs.attendanceAlerts}
            onChange={handleTogglePref('attendanceAlerts')}
          />
          <ToggleRow
            label="Department alerts"
            description="Notify when a department has no employees assigned"
            checked={settings.notificationPrefs.departmentAlerts}
            onChange={handleTogglePref('departmentAlerts')}
          />
        </div>

        <div className="settings-section">
          <div className="settings-section-header">
            <Icons.Settings />
            <span className="settings-section-title">Appearance</span>
          </div>
          <div className="settings-section-desc">
            Personalize how the app looks and how tables and lists are displayed.
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Theme</div>
              <div className="settings-row-desc">Switch between a light and dark interface</div>
            </div>
            <div className="theme-switch" role="group" aria-label="Theme">
              <button
                type="button"
                className={`theme-switch-option${settings.theme !== 'dark' ? ' active' : ''}`}
                onClick={() => handleThemeChange('light')}
                aria-pressed={settings.theme !== 'dark'}
              >
                <Icons.Sun /> Light
              </button>
              <button
                type="button"
                className={`theme-switch-option${settings.theme === 'dark' ? ' active' : ''}`}
                onClick={() => handleThemeChange('dark')}
                aria-pressed={settings.theme === 'dark'}
              >
                <Icons.Moon /> Dark
              </button>
            </div>
          </div>
          <ToggleRow
            label="Compact mode"
            description="Reduce padding in tables for a denser, more compact view"
            checked={settings.compactMode}
            onChange={handleCompactToggle}
          />
        </div>

        <div className="settings-section">
          <div className="settings-section-header">
            <Icons.AlertTriangle />
            <span className="settings-section-title">Danger Zone</span>
          </div>
          <div className="settings-section-desc">
            This resets your local profile, preferences, and appearance settings on this device.
            It does not delete any employee, department, or attendance data.
          </div>
          <div className="settings-danger-zone">
            <div>
              <div className="settings-row-label">Reset all local settings</div>
              <div className="settings-row-desc">
                {confirmingReset
                  ? 'Click again to confirm — this cannot be undone.'
                  : 'Restore profile, notifications, and appearance to defaults.'}
              </div>
            </div>
            <Button variant="danger" onClick={handleResetClick}>
              <Icons.RotateCcw /> {confirmingReset ? 'Confirm Reset' : 'Reset to Defaults'}
            </Button>
          </div>
        </div>
      </div>

      <Toast toast={toast} />
    </>
  );
}

export default Settings;
