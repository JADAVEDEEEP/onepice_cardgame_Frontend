import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Upload, Check } from 'lucide-react';
import { Link } from 'react-router';

export default function Onboarding() {
  const [step, setStep] = useState(1);

  const steps = [
    { number: 1, title: 'Import Cards', description: 'Upload your card database' },
    { number: 2, title: 'Import Decklists', description: 'Add your existing decks' },
    { number: 3, title: 'Import Match Data', description: 'Upload match history (optional)' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4">
      <Card className="w-full max-w-4xl p-8 bg-[var(--surface-1)] border-[var(--border-default)]">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Welcome to OPTCG DeckLab
          </h1>
          <p className="text-[var(--text-secondary)]">Let's get your data imported</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((s, idx) => (
            <div key={s.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${
                  step > s.number 
                    ? 'bg-[var(--state-success)] text-white'
                    : step === s.number
                    ? 'bg-[var(--accent-blue)] text-white'
                    : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
                }`}>
                  {step > s.number ? <Check className="w-6 h-6" /> : s.number}
                </div>
                <p className="text-xs mt-2 text-center text-[var(--text-secondary)]">{s.title}</p>
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-24 h-1 mx-4 ${
                  step > s.number ? 'bg-[var(--state-success)]' : 'bg-[var(--surface-2)]'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto">
          {step === 1 && (
            <div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Import Your Card Database</h3>
              <div className="border-2 border-dashed border-[var(--border-default)] rounded-lg p-12 text-center mb-6 hover:border-[var(--accent-blue)] transition-colors cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
                <p className="text-[var(--text-secondary)] mb-2">Drag and drop your CSV or JSON file</p>
                <p className="text-xs text-[var(--text-muted)]">or click to browse</p>
              </div>
              
              <div className="bg-[var(--surface-2)] rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">Supported Fields:</p>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[var(--text-muted)]">
                  <div>• card_code</div>
                  <div>• name</div>
                  <div>• color</div>
                  <div>• type</div>
                  <div>• cost</div>
                  <div>• power</div>
                  <div>• counter_value</div>
                  <div>• traits</div>
                </div>
              </div>

              <div className="bg-[var(--surface-2)] rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">Sample Preview:</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[var(--border-default)]">
                        <th className="text-left py-2 px-2 text-[var(--text-muted)]">card_code</th>
                        <th className="text-left py-2 px-2 text-[var(--text-muted)]">name</th>
                        <th className="text-left py-2 px-2 text-[var(--text-muted)]">color</th>
                        <th className="text-left py-2 px-2 text-[var(--text-muted)]">cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3].map((i) => (
                        <tr key={i} className="border-b border-[var(--border-soft)]">
                          <td className="py-2 px-2 font-mono">OP01-00{i}</td>
                          <td className="py-2 px-2">Sample Card {i}</td>
                          <td className="py-2 px-2">red</td>
                          <td className="py-2 px-2">{i}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Import Your Decklists</h3>
              <div className="border-2 border-dashed border-[var(--border-default)] rounded-lg p-12 text-center mb-6 hover:border-[var(--accent-blue)] transition-colors cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
                <p className="text-[var(--text-secondary)] mb-2">Upload your decklist files</p>
                <p className="text-xs text-[var(--text-muted)]">Supports CSV, JSON, or text format</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Import Match History (Optional)</h3>
              <div className="border-2 border-dashed border-[var(--border-default)] rounded-lg p-12 text-center mb-6 hover:border-[var(--accent-blue)] transition-colors cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
                <p className="text-[var(--text-secondary)] mb-2">Upload your match data</p>
                <p className="text-xs text-[var(--text-muted)]">This helps generate better analytics</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            ) : (
              <div />
            )}
            
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)}>
                Next Step
              </Button>
            ) : (
              <Link to="/dashboard">
                <Button>
                  Start Analytics
                </Button>
              </Link>
            )}
          </div>

          {step === 3 && (
            <div className="text-center mt-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  Skip for now
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
