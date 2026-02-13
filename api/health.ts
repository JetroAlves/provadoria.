
export default async function handler(req: any, res: any) {
    res.status(200).json({
        status: 'basic_ok',
        timestamp: new Date().toISOString(),
        envKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('GEMINI'))
    });
}
