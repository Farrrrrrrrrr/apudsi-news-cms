export default function WorkflowTimeline({ article }) {
  // Format dates for display
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleString();
  };
  
  // Define timeline steps based on workflow status
  const steps = [
    { 
      name: 'Draft', 
      status: 'complete', 
      date: formatDate(article.created_at),
      description: `Created by ${article.author_name}`
    },
    { 
      name: 'Submitted', 
      status: article.submitted_at ? 'complete' : 'upcoming',
      date: formatDate(article.submitted_at),
      description: article.submitted_at ? 'Submitted for review' : 'Not yet submitted'
    },
    { 
      name: 'Review', 
      status: article.reviewed_at ? 'complete' : (article.submitted_at ? 'current' : 'upcoming'),
      date: formatDate(article.reviewed_at),
      description: article.reviewed_at 
        ? `Reviewed by ${article.reviewer_name || 'Editor'}`
        : (article.submitted_at ? 'Waiting for review' : 'Not yet reviewed')
    },
    { 
      name: 'Publish', 
      status: article.published_at ? 'complete' : (article.workflow_status === 'approved' ? 'current' : 'upcoming'),
      date: formatDate(article.published_at),
      description: article.published_at 
        ? `Published by ${article.publisher_name || 'Publisher'}`
        : (article.workflow_status === 'approved' ? 'Ready to publish' : 'Not yet published')
    }
  ];

  return (
    <div className="flow-root">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Article Workflow Status</h2>
      <ul className="-mb-8">
        {steps.map((step, stepIdx) => (
          <li key={step.name}>
            <div className="relative pb-8">
              {stepIdx !== steps.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span
                    className={`h-8 w-8 rounded-full flex items-center justify-center ring-1 ring-inset ${
                      step.status === 'complete'
                        ? 'bg-green-100 ring-green-600 text-green-600'
                        : step.status === 'current'
                        ? 'bg-blue-100 ring-blue-600 text-blue-600'
                        : step.status === 'upcoming'
                        ? 'bg-gray-100 ring-gray-400 text-gray-400'
                        : 'bg-red-100 ring-red-600 text-red-600'
                    }`}
                  >
                    {step.status === 'complete' ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : step.status === 'current' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-current" />
                    )}
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-900">{step.name}</p>
                    {step.date && <p className="text-xs text-gray-500">{step.date}</p>}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{step.description}</p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      
      {article.rejection_reason && (
        <div className="mt-2 px-4 py-3 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-sm font-medium text-red-800">Revision Required</h3>
          <p className="mt-1 text-sm text-red-700">{article.rejection_reason}</p>
        </div>
      )}
    </div>
  );
}
