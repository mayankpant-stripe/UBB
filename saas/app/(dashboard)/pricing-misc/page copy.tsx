'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

// ...existing code...

export default function PricingMiscPage() {
  // ...existing state...
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showStudentEmailForm, setShowStudentEmailForm] = useState(false);
  const [showInstallmentEmailForm, setShowInstallmentEmailForm] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentName, setStudentName] = useState('');
  const [installmentEmail, setInstallmentEmail] = useState('');
  const [installmentName, setInstallmentName] = useState('');
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const searchParams = useSearchParams();

  // --- ElevenLabs transcript and agent response chat state ---
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'agent', text: string }[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- Listen for ElevenLabs JSON events ---
  useEffect(() => {
    // Replace with your actual ElevenLabs WebSocket endpoint
    const ws = new WebSocket('wss://your-elevenlabs-server-url');

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'user_transcript' && data.text) {
          setChatMessages((prev) => [...prev, { sender: 'user', text: data.text }]);
        }
        if (data.event === 'agent_response' && data.text) {
          setChatMessages((prev) => [...prev, { sender: 'agent', text: data.text }]);
        }
      } catch (e) {
        // Ignore non-JSON or malformed messages
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    return () => {
      ws.close();
    };
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ...existing code...

  return (
    <main className="min-h-screen bg-black">
      {/* ElevenLabs Chat Interface */}
      <div className="fixed bottom-28 right-4 z-50 w-96 max-w-full">
        <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto">
          <div className="font-bold text-white mb-2">AI Voice Chat</div>
          <div>
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-2 p-2 rounded-lg text-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-800 text-white self-end ml-16'
                    : 'bg-gray-700 text-gray-100 self-start mr-16'
                }`}
              >
                <span className="block">{msg.text}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>

      {/* ...existing code... */}
    </main>
  );
}