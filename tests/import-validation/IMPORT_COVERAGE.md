# Import Detection Coverage Report

## Supported Languages & Import Styles

### ✅ JavaScript/TypeScript (FULLY SUPPORTED)

**Supported patterns:**
- ✅ ES6 imports: `import X from './file'`
- ✅ ES6 named imports: `import { X, Y } from './file'`
- ✅ ES6 wildcard: `import * as X from './file'`
- ✅ CommonJS: `require('./file')`
- ✅ CommonJS destructuring: `const { X } = require('./file')`
- ✅ Auto-resolves missing extensions (.js, .ts, .jsx, .tsx)
- ✅ Local imports only (starts with `.` or `/`)

**Regex patterns:**
```regex
ES6: /import\s+(?:[\w{},\s*]+\s+from\s+)?['"]([^'"]+)['"]/g
CommonJS: /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g
```

### ✅ Python (RELATIVE IMPORTS SUPPORTED)

**Supported patterns:**
- ✅ Relative imports: `from .module import X`
- ✅ Parent imports: `from ..module import X`
- ✅ Multi-level: `from ...utils.helpers import X`
- ❌ Absolute imports: `from package import X` (filtered out)

**Regex patterns:**
```regex
from: /from\s+([.\w]+)\s+import/g
import: /^import\s+([\w.]+)/gm
```

**Conversion logic:**
- `.module` → `./module.py`
- `..utils.helpers` → `../utils/helpers.py`
- Only processes imports starting with `.`

### ✅ Java (PACKAGE IMPORTS)

**Supported patterns:**
- ✅ Package imports: `import com.example.Utils;`
- ❌ Standard library: `import java.*` (filtered out)
- ❌ JDK packages: `import javax.*` (filtered out)

**Regex patterns:**
```regex
/import\s+([\w.]+);/g
```

**Conversion logic:**
- `com.example.Utils` → `com/example/Utils.java`

### ✅ Go (LOCAL PACKAGES)

**Supported patterns:**
- ✅ Single import: `import "./package"`
- ✅ Multi-import block:
  ```go
  import (
    "./local"
    "./another"
  )
  ```
- ❌ External packages (filtered out)

**Regex patterns:**
```regex
Single: /import\s+"([^"]+)"/g
Block: /import\s*\(\s*([\s\S]*?)\s*\)/g
```

### ✅ Ruby (REQUIRES)

**Supported patterns:**
- ✅ require: `require './file'`
- ✅ require_relative: `require_relative './file'`
- ✅ Auto-adds `.rb` extension

**Regex patterns:**
```regex
/require(?:_relative)?\s+['"]([^'"]+)['"]/g
```

### ✅ C# (NAMESPACE USING)

**Supported patterns:**
- ✅ Using statements: `using MyNamespace.MyClass;`
- ❌ System namespace: `using System.*` (filtered out)

**Regex patterns:**
```regex
/using\s+([\w.]+);/g
```

**Conversion logic:**
- `MyNamespace.MyClass` → `MyNamespace/MyClass.cs`

### ✅ PHP (REQUIRES & NAMESPACES)

**Supported patterns:**
- ✅ require: `require './file.php'`
- ✅ include: `include './file.php'`
- ✅ require_once: `require_once './file.php'`
- ✅ include_once: `include_once './file.php'`
- ✅ use statements: `use My\Namespace\Class;`

**Regex patterns:**
```regex
Require: /(?:require|include)(?:_once)?\s+['"]([^'"]+)['"]/g
Use: /use\s+([\w\\]+);/g
```

### ✅ Rust (CRATE MODULES)

**Supported patterns:**
- ✅ Crate modules: `use crate::module::submodule;`
- ❌ External crates (filtered out)

**Regex patterns:**
```regex
/use\s+crate::([\w:]+)/g
```

### ✅ Kotlin (PACKAGE IMPORTS)

**Supported patterns:**
- ✅ Package imports: `import com.example.Utils`
- ❌ Standard library: `import kotlin.*` (filtered out)
- ❌ Android/Java std: `import android.*`, `import java.*` (filtered out)

**Regex patterns:**
```regex
/import\s+([\w.]+)/g
```

### ✅ Swift (MODULE IMPORTS)

**Supported patterns:**
- ✅ Local imports: `import ./MyModule`
- ❌ Framework imports: `import Foundation` (filtered out)

**Regex patterns:**
```regex
/import\s+([.\w]+)/g
```

### ✅ C/C++ (LOCAL INCLUDES)

**Supported patterns:**
- ✅ Local includes: `#include "local.h"`
- ❌ System includes: `#include <system.h>` (uses angle brackets)

**Regex patterns:**
```regex
/#include\s+"([^"]+)"/g
```

**Note:** Only matches `"quotes"`, not `<angle brackets>`

## Known Limitations

### 1. Python Absolute Imports ⚠️
**Issue:** Absolute imports like `from helpers import X` are NOT detected
**Reason:** Parser only processes imports starting with `.` (relative imports)
**Workaround:** Users should use relative imports in tests
**Example:**
```python
# ❌ Not detected
from helpers import flaky_function

# ✅ Detected
from .helpers import flaky_function
```

### 2. Dynamic Imports ⚠️
**Issue:** Dynamic imports are NOT detected in any language
**Examples:**
```javascript
// ❌ Not detected
const module = await import(variablePath);
require(variablePath);

// ✅ Detected
const module = await import('./static/path');
```

### 3. Webpack/Alias Imports ⚠️
**Issue:** Build tool aliases are NOT resolved
**Examples:**
```javascript
// ❌ Not detected (webpack alias)
import X from '@/utils'
import Y from '~/helpers'

// ✅ Detected
import X from '../../utils'
```

### 4. Conditional Imports ⚠️
**Issue:** Imports inside conditions may be missed
**Examples:**
```python
# ❌ Not detected
if condition:
    from .helpers import X
```

### 5. External Package Detection
**Note:** By design, only LOCAL imports are tracked
- npm packages (node_modules) - ignored
- Python pip packages - ignored
- Java maven dependencies - ignored
- Go external packages - ignored

## Test Coverage Matrix

| Language | ES6/Modern | Legacy | Relative | Absolute | Status |
|----------|------------|--------|----------|----------|--------|
| JavaScript | ✅ | ✅ (require) | ✅ | ✅ | **Full** |
| TypeScript | ✅ | ✅ (require) | ✅ | ✅ | **Full** |
| Python | ✅ (from .X) | ✅ (import .X) | ✅ | ❌ | **Partial** |
| Java | ✅ | N/A | N/A | ✅ | **Full** |
| Go | ✅ | N/A | ✅ | ❌ | **Full** |
| Ruby | ✅ | ✅ | ✅ | ❌ | **Full** |
| C# | ✅ | N/A | N/A | ✅ | **Full** |
| PHP | ✅ (use) | ✅ (require) | ✅ | ✅ | **Full** |
| Rust | ✅ | N/A | ✅ (crate) | ❌ | **Full** |
| Kotlin | ✅ | N/A | N/A | ✅ | **Full** |
| Swift | ✅ | N/A | ✅ | ❌ | **Full** |
| C/C++ | ✅ (#include "") | N/A | ✅ | ❌ | **Full** |

## Recommendations for Users

### For Python Users:
⚠️ **IMPORTANT:** Use relative imports in test files
```python
# Recommended structure
tests/
  test_example.py
  helpers.py

# In test_example.py
from .helpers import utility_function  # ✅ Will be detected
```

### For JavaScript/TypeScript Users:
✅ Both ES6 and CommonJS work perfectly
```javascript
// Both work
import { utils } from './utils';     // ✅
const { utils } = require('./utils'); // ✅
```

### For All Users:
1. Avoid dynamic import paths with variables
2. Use relative paths (./file) not aliases (@/file)
3. Structure tests to co-locate dependencies
4. Use package managers for external dependencies

## Action Behavior

When the import parser encounters unsupported scenarios:
1. Returns empty array `[]`
2. Hash calculation proceeds WITHOUT imported file content
3. Test tracking still works (just without dependency tracking)
4. No errors thrown - graceful degradation

This means users with unsupported import patterns can still:
- ✅ Track test pass/fail history
- ✅ Detect flaky tests
- ✅ Get AI-generated fixes
- ❌ Miss dependency-based hash changes
