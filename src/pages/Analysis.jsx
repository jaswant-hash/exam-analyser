import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import RevisionPlan from '../components/sttp/RevisionPlan';
import AnalysisResults from '../components/sttp/AnalysisResults';
import LoadingOverlay from '../components/shared/LoadingOverlay';
import { fetchTestAttemptById } from '../services/firebaseService';

export default function Analysis() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [testData, setTestData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      // For demo purposes, we will still show a layout if no ID is provided,
      // but ideally we would redirect or show an error.
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchTestAttemptById(id);
        setTestData(data);
      } catch (err) {
        console.error('Failed to load analysis:', err);
        setError('Failed to load analysis data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return <LoadingOverlay isVisible={true} message="Loading analysis results..." />;
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h2 className="text-3xl font-bold text-red-500 mb-4">Error</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <button onClick={() => navigate('/upload')} className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl">
          Upload New Test
        </button>
      </div>
    );
  }

  // If no ID is passed, prompt the user to upload
  if (!id || !testData) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <div className="text-6xl mb-6">📊</div>
        <h2 className="text-3xl font-bold text-white mb-3">No Analysis Yet</h2>
        <p className="text-gray-400 mb-8 max-w-md">
          Upload your exam file first to see your personalized AI analysis, weak topics, and 3-day revision plan.
        </p>
        <button
          onClick={() => navigate('/upload')}
          className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl transition-all"
        >
          Upload Exam File →
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-0 -mt-12 bg-black min-h-screen">
      <AnalysisResults report={testData} testData={testData} />
      <RevisionPlan planData={testData.revisionPlan} />
    </div>
  );
}
