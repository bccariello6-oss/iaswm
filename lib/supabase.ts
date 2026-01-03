import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Certifique-se de configurar as variáveis de ambiente do Supabase (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY) no arquivo .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    },
    global: {
        headers: { 'x-application-name': 'SWM-Brasil-Maint' }
    }
});

/**
 * Utilitário para verificar se a conexão com o Supabase está ativa.
 */
export const checkConnection = async (): Promise<boolean> => {
    try {
        const { error } = await supabase.from('parts').select('id').limit(1);
        return !error;
    } catch (err) {
        return false;
    }
};
