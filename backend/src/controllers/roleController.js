const Role = require('../models/Role');
const Permission = require('../models/Permission');

// Initialize roles and permissions
exports.initializeRoles = async (req, res) => {
  try {
    await Role.initializeRoles();
    res.json({ message: 'Roles and permissions initialized successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error initializing roles', error: error.message });
  }
};

// Get all roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find().populate('permissions');
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching roles', error: error.message });
  }
};

// Get role by ID
exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id).populate('permissions');
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching role', error: error.message });
  }
};

// Create new role
exports.createRole = async (req, res) => {
  try {
    const { name, description, permissions, hierarchy } = req.body;
    
    // Validate hierarchy
    if (hierarchy < 1 || hierarchy > 4) {
      return res.status(400).json({ message: 'Invalid hierarchy level' });
    }

    const role = new Role({
      name,
      description,
      permissions,
      hierarchy
    });

    await role.save();
    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ message: 'Error creating role', error: error.message });
  }
};

// Update role
exports.updateRole = async (req, res) => {
  try {
    const { name, description, permissions, hierarchy, isActive } = req.body;
    
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Prevent updating system roles
    if (['coordinator', 'supervisor', 'student', 'examiner'].includes(role.name)) {
      return res.status(403).json({ message: 'Cannot modify system roles' });
    }

    role.name = name || role.name;
    role.description = description || role.description;
    role.permissions = permissions || role.permissions;
    role.hierarchy = hierarchy || role.hierarchy;
    role.isActive = isActive !== undefined ? isActive : role.isActive;

    await role.save();
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: 'Error updating role', error: error.message });
  }
};

// Delete role
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Prevent deleting system roles
    if (['coordinator', 'supervisor', 'student', 'examiner'].includes(role.name)) {
      return res.status(403).json({ message: 'Cannot delete system roles' });
    }

    await role.remove();
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting role', error: error.message });
  }
};

// Get all permissions
exports.getPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find();
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching permissions', error: error.message });
  }
}; 