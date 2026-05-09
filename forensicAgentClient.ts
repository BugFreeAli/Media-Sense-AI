import { NormalizedAnalysisResult } from './types';

export class ForensicAgentClient {
    // Production Google Cloud Run Endpoint
    private static readonly API_URL = "https://mediasense-api-558173430801.us-central1.run.app/api/analyze";

    public static async analyzeImage(file: File): Promise<NormalizedAnalysisResult> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(this.API_URL, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Forensic Agent API unreachable.');
        }
        
        const data = await response.json();
        
        const isAi = data.is_ai_generated;
        const conf = data.confidence_score;

        return {
            prediction: isAi ? 'AI' : 'Real',
            confidence: conf,
            probabilities: {
                ai: isAi ? (conf / 100) : ((100 - conf) / 100),
                real: isAi ? ((100 - conf) / 100) : (conf / 100)
            },
            details: {
                forensic_report: data.forensic_report,
                media_type: 'image'
            }
        };
    }
}
