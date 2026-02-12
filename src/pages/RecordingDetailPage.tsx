import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Recording } from '../types';
import { useTranscription } from '../hooks/useTranscription';
import { useSummarization } from '../hooks/useSummarization';
import * as store from '../storage/recordingsStore';
import AudioPlayer from '../components/AudioPlayer';
import TranscriptView from '../components/TranscriptView';
import SummaryView from '../components/SummaryView';
import StatusBadge from '../components/StatusBadge';

export default function RecordingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recording, setRecording] = useState<Recording | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { transcribe, isTranscribing, error: transcribeError } = useTranscription();
  const { summarize, isSummarizing, error: summarizeError } = useSummarization();

  const loadRecording = useCallback(async () => {
    if (!id) return;
    const rec = await store.getRecording(id);
    setRecording(rec || null);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadRecording();
  }, [loadRecording]);

  const handleTranscribe = async () => {
    if (!recording) return;

    await store.updateRecording(recording.id, { status: 'transcribing' });
    setRecording((r) => (r ? { ...r, status: 'transcribing' } : null));

    try {
      const { transcript, detectedLanguage } = await transcribe(
        recording.audioChunks,
        recording.languageCode
      );
      await store.updateRecording(recording.id, {
        transcript,
        detectedLanguage,
        status: 'transcribed',
        error: null,
      });
      setRecording((r) =>
        r ? { ...r, transcript, detectedLanguage, status: 'transcribed', error: null } : null
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Transcription failed';
      await store.updateRecording(recording.id, { status: 'error', error: msg });
      setRecording((r) => (r ? { ...r, status: 'error', error: msg } : null));
    }
  };

  const handleSummarize = async () => {
    if (!recording || !recording.transcript) return;

    await store.updateRecording(recording.id, { status: 'summarizing' });
    setRecording((r) => (r ? { ...r, status: 'summarizing' } : null));

    try {
      const summary = await summarize(recording.transcript);
      await store.updateRecording(recording.id, {
        summary,
        status: 'completed',
        error: null,
      });
      setRecording((r) =>
        r ? { ...r, summary, status: 'completed', error: null } : null
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Summarization failed';
      await store.updateRecording(recording.id, { status: 'error', error: msg });
      setRecording((r) => (r ? { ...r, status: 'error', error: msg } : null));
    }
  };

  const handleTranscribeAndSummarize = async () => {
    if (!recording) return;

    await store.updateRecording(recording.id, { status: 'transcribing' });
    setRecording((r) => (r ? { ...r, status: 'transcribing' } : null));

    try {
      const { transcript, detectedLanguage } = await transcribe(
        recording.audioChunks,
        recording.languageCode
      );
      await store.updateRecording(recording.id, {
        transcript,
        detectedLanguage,
        status: 'summarizing',
      });
      setRecording((r) =>
        r ? { ...r, transcript, detectedLanguage, status: 'summarizing' } : null
      );

      const summary = await summarize(transcript);
      await store.updateRecording(recording.id, {
        summary,
        status: 'completed',
        error: null,
      });
      setRecording((r) =>
        r ? { ...r, summary, status: 'completed', error: null } : null
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Processing failed';
      await store.updateRecording(recording.id, { status: 'error', error: msg });
      setRecording((r) => (r ? { ...r, status: 'error', error: msg } : null));
    }
  };

  const handleDelete = async () => {
    if (!recording) return;
    await store.deleteRecording(recording.id);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!recording) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <p className="text-lg text-gray-500">Recording not found</p>
        <button onClick={() => navigate('/')} className="btn-primary mt-4">
          Go Home
        </button>
      </div>
    );
  }

  const isProcessing = isTranscribing || isSummarizing;

  return (
    <div className="px-4 py-4 flex flex-col gap-4">
      {/* Back button + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"
          aria-label="Go back"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900 truncate">{recording.title}</h2>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={recording.status} />
            {recording.detectedLanguage && (
              <span className="text-sm text-gray-500">
                {recording.detectedLanguage}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Audio Player */}
      <AudioPlayer audioBlob={recording.audioBlob} mimeType={recording.audioMimeType} />

      {/* Action Buttons */}
      {recording.status === 'recorded' && (
        <button
          onClick={handleTranscribeAndSummarize}
          disabled={isProcessing}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Transcribe &amp; Summarize
            </>
          )}
        </button>
      )}

      {recording.status === 'transcribed' && !recording.summary && (
        <button
          onClick={handleSummarize}
          disabled={isSummarizing}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          {isSummarizing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Summarizing...
            </>
          ) : (
            'Summarize'
          )}
        </button>
      )}

      {recording.status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-sm text-red-700 font-medium">Error</p>
          <p className="text-sm text-red-600 mt-1">
            {recording.error || transcribeError || summarizeError}
          </p>
          <button
            onClick={recording.transcript ? handleSummarize : handleTranscribe}
            className="btn-primary mt-3 text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Transcript */}
      {recording.transcript && <TranscriptView transcript={recording.transcript} />}

      {/* Summary */}
      {recording.summary && <SummaryView summary={recording.summary} />}

      {/* Delete button */}
      <div className="pt-4 border-t border-gray-200">
        {showDeleteConfirm ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-base font-medium text-gray-800 mb-3">
              Delete this recording? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="btn-primary flex-1 bg-red-600">
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-3 text-base font-medium text-red-600 active:text-red-800"
          >
            Delete Recording
          </button>
        )}
      </div>
    </div>
  );
}
