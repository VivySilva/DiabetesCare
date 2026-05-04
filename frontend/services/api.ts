const API_URL = "http://localhost:3001";

export async function loginUser(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.erro || errorData.error || "Erro ao fazer login");
  }

  return response.json();
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "patient" | "professional";
  licenseNumber?: string;
  phone?: string;
}) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.erro || errorData.error || "Erro ao fazer cadastro");
  }

  return response.json();
}

export async function requestPasswordRecovery(email: string) {
  const response = await fetch(`${API_URL}/forgot_password/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.erro || errorData.message || "Erro ao solicitar recuperação de senha");
  }

  return response.json();
}

export async function resetPassword(token: string, newPassword: string) {
  const response = await fetch(`${API_URL}/forgot_password/reset`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, new_password: newPassword }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.erro || errorData.message || "Erro ao redefinir senha");
  }

  return response.json();
}

export async function registerGlucose(data: {
  glucose_value: number;
  period: string;
  took_insulin: boolean;
  insulin_type?: string;
  insulin_amount?: number;
  injection_site?: string;
  symptoms?: string[];
  symptom_intensity?: number;
}, token: string) {
  const response = await fetch(`${API_URL}/glucose_record`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.erro || errorData.message || "Erro ao registrar glicemia");
  }

  return response.json();
}

export async function getGlucoseRecords(token: string) {
  const response = await fetch(`${API_URL}/glucose_record`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Erro ao buscar registros de glicose.");
  return response.json();
}

export async function registerMedication(data: {
  category: string;
  medication_name: string;
  time: string;
  notify: boolean;
}, token: string) {
  const response = await fetch(`${API_URL}/medication_record`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.erro || errorData.message || "Erro ao registrar medicamento");
  }

  return response.json();
}

// =============================================
// COMMUNITY POSTS
// =============================================

export async function getCommunityPosts() {
  const response = await fetch(`${API_URL}/community_post`);
  if (!response.ok) throw new Error("Erro ao buscar publicações.");
  return response.json();
}

export async function getCommunityPostById(id: string) {
  const response = await fetch(`${API_URL}/community_post/${id}`);
  if (!response.ok) throw new Error("Publicação não encontrada.");
  return response.json();
}

export async function createCommunityPost(data: {
  title: string;
  cover_image_url?: string | null;
  category: string;
  content_html: string;
}, token: string) {
  const response = await fetch(`${API_URL}/community_post`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.erro || "Erro ao criar publicação.");
  }
  return response.json();
}

export async function updateCommunityPost(id: string, data: {
  title?: string;
  cover_image_url?: string | null;
  category?: string;
  content_html?: string;
}, token: string) {
  const response = await fetch(`${API_URL}/community_post/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.erro || "Erro ao atualizar publicação.");
  }
  return response.json();
}

export async function deleteCommunityPost(id: string, token: string) {
  const response = await fetch(`${API_URL}/community_post/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.erro || "Erro ao remover publicação.");
  }
  return response.json();
}

// =============================================
// FORUM
// =============================================

export async function getForumTopics() {
  const response = await fetch(`${API_URL}/forum`);
  if (!response.ok) throw new Error("Erro ao buscar tópicos do fórum.");
  return response.json();
}

export async function getForumTopicById(id: string) {
  const response = await fetch(`${API_URL}/forum/${id}`);
  if (!response.ok) throw new Error("Erro ao buscar tópico.");
  return response.json();
}

export async function createForumTopic(data: { title: string; preview?: string }, token: string) {
  const response = await fetch(`${API_URL}/forum`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.erro || "Erro ao criar tópico.");
  }
  return response.json();
}

export async function replyToForumTopic(topicId: string, content: string, token: string) {
  const response = await fetch(`${API_URL}/forum/${topicId}/reply`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.erro || "Erro ao enviar resposta.");
  }
  return response.json();
}

export async function likeForumTopic(topicId: string, token: string) {
  const response = await fetch(`${API_URL}/forum/${topicId}/like`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Erro ao curtir tópico.");
  return response.json();
}

export async function unlikeForumTopic(topicId: string, token: string) {
  const response = await fetch(`${API_URL}/forum/${topicId}/like`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Erro ao remover curtida.");
  return response.json();
}

// =============================================
// NOTIFICATIONS
// =============================================

export async function getNotifications(token: string) {
  const response = await fetch(`${API_URL}/notification`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Erro ao buscar notificações.");
  return response.json();
}

export async function markNotificationRead(id: string, token: string) {
  const response = await fetch(`${API_URL}/notification/${id}/read`, {
    method: "PATCH",
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Erro ao marcar notificação.");
  return response.json();
}

export async function markAllNotificationsRead(token: string) {
  const response = await fetch(`${API_URL}/notification/read_all`, {
    method: "PATCH",
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Erro ao marcar notificações.");
  return response.json();
}

// =============================================
// USER / PROFILE
// =============================================

export async function getUserProfile(token: string) {
  const response = await fetch(`${API_URL}/user/me`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Erro ao buscar perfil.");
  return response.json();
}

export async function updateUserProfile(data: any, token: string) {
  const response = await fetch(`${API_URL}/user/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detalhe || errorData.erro || "Erro ao atualizar perfil.");
  }
  
  return response.json();
}