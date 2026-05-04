import supabase from "./config/supabase";

async function fixDatabase() {
    console.log("Tentando criar a tabela forum_likes...");
    const { error } = await supabase.rpc('admin_sql', { sql_query: `
        CREATE TABLE IF NOT EXISTS forum_likes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            topic_id UUID REFERENCES forum_topics(id) ON DELETE CASCADE,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(topic_id, user_id)
        );
    ` }).catch(() => ({ error: { message: 'RPC admin_sql não disponível' } }));

    if (error) {
        console.log("Não foi possível usar RPC, tentando via query direta...");
        // Se não tiver RPC, o próprio erro do insert na rota vai nos dizer o que houve.
    } else {
        console.log("Tabela verificada/criada com sucesso!");
    }
}

fixDatabase();
