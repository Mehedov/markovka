// lib/db.ts
export const db = {
	groups: [
		{ id: '1', name: 'Дизайн-24' },
		{ id: '2', name: 'Разработка-25' },
	],
	students: [{ id: '101', fullName: 'Алексей Иванов', groupId: '1' }],
	attendance: {} as Record<string, string>,
	users: [
		{ id: '1', username: 'admin', password: 'admin' }, // Начальный пользователь
	],
}
