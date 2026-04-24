import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../../../Database/db';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';

/**
 * GET /admin/couriers
 * Retrieves system couriers and their configuration parameters.
 */
export const getCourierConfigurations = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { rows } = await db.query(
            `SELECT id, name, code, rating, is_active, api_config FROM couriers ORDER BY name ASC`
        );

        return res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('getCourierConfigurations error:', error);
        return res.status(500).json({ success: false, error: { code: 'SERVER_001', message: 'Internal server error' } });
    }
};

/**
 * PATCH /admin/couriers/:id
 * Modifies dynamic configuration like active bounds or markup percentage without server reboot.
 */
export const updateCourierConfiguration = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { is_active, markup_percentage } = req.body;

        // Verify courier exists
        const { rows: current } = await db.query('SELECT api_config FROM couriers WHERE id = $1', [id]);
        if (current.length === 0) {
            return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Courier not found' } });
        }

        const config = current[0].api_config || {};
        
        if (markup_percentage !== undefined) {
            config.markup_percentage = markup_percentage;
        }

        let updateQuery = 'UPDATE couriers SET api_config = $1';
        const params: any[] = [config];

        if (is_active !== undefined) {
            updateQuery += ', is_active = $2';
            params.push(is_active);
            updateQuery += ' WHERE id = $3';
            params.push(id);
        } else {
            updateQuery += ' WHERE id = $2';
            params.push(id);
        }

        await db.query(updateQuery, params);

        // Audit Log Entry
        const adminId = req.user?.userId;
        await db.query(`
          INSERT INTO audit_logs (id, admin_id, resource_id, action, details)
          VALUES ($1, $2, $3, $4, $5)
        `, [uuidv4(), adminId, id, 'UPDATE_COURIER_CONFIG', JSON.stringify({ is_active, markup_percentage })]);

        return res.status(200).json({
            success: true,
            data: { message: 'Courier configuration successfully updated' }
        });
    } catch (error) {
        console.error('updateCourierConfiguration error:', error);
        return res.status(500).json({ success: false, error: { code: 'SERVER_001', message: 'Internal server error' } });
    }
};
